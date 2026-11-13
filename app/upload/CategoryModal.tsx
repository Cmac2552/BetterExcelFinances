"use client";

import { useState, useEffect, useRef, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TiPencil } from "react-icons/ti";
import { GoXCircleFill } from "react-icons/go";
import { Sparkles, Plus, Search, Tag, Loader2 } from "lucide-react";
import {
  fetchUserCategories,
  createCategory,
  createDefaultCategories,
  updateCategory,
  deleteCategory,
} from "@/app/actions/category";

interface Category {
  id: number;
  name: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export function CategoryModal() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Edit state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");

  // Delete confirm state
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [isPending, startTransition] = useTransition();
  const editInputRef = useRef<HTMLInputElement>(null);

  // Load categories when dialog opens
  useEffect(() => {
    if (isOpen) {
      loadCategories();
      setErrorMessage(null);
      setSearchQuery("");
      setDeletingId(null);
      setEditingId(null);
    }
  }, [isOpen]);

  // Focus input when editing starts
  useEffect(() => {
    if (editingId !== null && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingId]);

  async function loadCategories() {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await fetchUserCategories();
      setCategories(data);
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to load categories");
    } finally {
      setIsLoading(false);
    }
  }

  function handleAddCategory() {
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;

    setErrorMessage(null);
    startTransition(async () => {
      try {
        const res = await createCategory(trimmed);
        if (res.category) {
          setCategories((prev) =>
            [...prev, res.category].sort((a, b) =>
              a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
            )
          );
          setNewCategoryName("");
          router.refresh();
        }
      } catch (err: any) {
        setErrorMessage(err?.message || "Failed to add category");
      }
    });
  }

  function handleAddDefaults() {
    setErrorMessage(null);
    startTransition(async () => {
      try {
        await createDefaultCategories();
        await loadCategories();
        router.refresh();
      } catch (err: any) {
        setErrorMessage(err?.message || "Failed to create default categories");
      }
    });
  }

  function handleSaveEdit(id: number) {
    const trimmed = editName.trim();
    if (!trimmed) return;

    setErrorMessage(null);
    startTransition(async () => {
      try {
        const res = await updateCategory(id, trimmed);
        if (res.category) {
          setCategories((prev) =>
            prev
              .map((c) => (c.id === id ? res.category : c))
              .sort((a, b) =>
                a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
              )
          );
          setEditingId(null);
          setEditName("");
          router.refresh();
        }
      } catch (err: any) {
        setErrorMessage(err?.message || "Failed to update category");
      }
    });
  }

  function handleDeleteConfirm(id: number) {
    setErrorMessage(null);
    startTransition(async () => {
      try {
        await deleteCategory(id);
        setCategories((prev) => prev.filter((c) => c.id !== id));
        setDeletingId(null);
        router.refresh();
      } catch (err: any) {
        setErrorMessage(err?.message || "Failed to delete category");
      }
    });
  }

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const q = searchQuery.toLowerCase().trim();
    return categories.filter((c) => c.name.toLowerCase().includes(q));
  }, [categories, searchQuery]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" className="gap-2">
          <Tag className="w-4 h-4 text-[#f4f0e1]" />
          <span>Manage Categories</span>
          {categories.length > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-xs font-semibold bg-gray-800 text-gray-300 border border-gray-700">
              {categories.length}
            </span>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl bg-[#141414] border border-gray-800 p-6 text-[#f4f0e1] shadow-2xl sm:rounded-xl">
        <DialogHeader className="pb-3 border-b border-gray-800 pr-8">
          <div className="flex items-center gap-3">
            <DialogTitle className="text-xl font-bold text-[#f4f0e1] flex items-center gap-2">
              <Tag className="w-5 h-5 text-gray-400" />
              <span>Budget Categories</span>
            </DialogTitle>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#1E2228] text-gray-300 border border-gray-700 font-medium">
              {categories.length} {categories.length === 1 ? "category" : "categories"}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Define your budget categories. Statements uploaded via CSV will be automatically categorized to these with Jev AI.
          </p>
        </DialogHeader>

        <div className="space-y-4 pt-3">
          {/* Create Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Add New Category
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="e.g. Groceries, Dining Out, Utilities..."
                className="flex-1 px-4 py-2 bg-[#1E2228] text-[#f4f0e1] border border-gray-700 rounded-lg focus:ring-2 focus-visible:ring-[#f4f0e1] focus-visible:outline-none placeholder-gray-500 text-sm shadow-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCategory();
                  }
                }}
                disabled={isPending}
              />
              <Button
                variant="primary"
                onClick={handleAddCategory}
                disabled={!newCategoryName.trim() || isPending}
                className="px-4 shadow-sm"
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="text-red-300 text-xs font-medium bg-red-950/30 border border-red-900/50 px-3 py-2 rounded-lg flex items-center justify-between">
              <span>{errorMessage}</span>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="text-red-400 hover:text-red-200 text-xs ml-2"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Quick Actions & Search */}
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter categories..."
                className="w-full pl-9 pr-3 py-1.5 bg-[#1E2228]/80 text-[#f4f0e1] border border-gray-800 rounded-lg focus:ring-1 focus-visible:ring-[#f4f0e1] text-xs placeholder-gray-500"
              />
            </div>

            {categories.length < 5 && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleAddDefaults}
                disabled={isPending}
                title="Add common categories (Groceries, Dining, Travel, etc.)"
                className="text-xs shrink-0 gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                Add Starter Set
              </Button>
            )}
          </div>

          {/* Categories List Container */}
          <div className="h-[320px] bg-[#1E2228] rounded-lg border border-gray-800 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading categories...</span>
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm p-6 text-center gap-2">
                {categories.length === 0 ? (
                  <>
                    <span className="font-semibold text-gray-300">No categories created yet</span>
                    <span className="text-xs text-gray-500 max-w-xs">
                      Add custom categories above or click &ldquo;Add Starter Set&rdquo; to populate common financial categories.
                    </span>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleAddDefaults}
                      disabled={isPending}
                      className="mt-2 text-xs gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                      Add Starter Set
                    </Button>
                  </>
                ) : (
                  <span>No categories match &ldquo;{searchQuery}&rdquo;</span>
                )}
              </div>
            ) : (
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-[#191D23] border-b border-gray-800 z-10">
                  <tr>
                    <th className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Category Name
                    </th>
                    <th className="px-5 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  {filteredCategories.map((category) => {
                    const isEditing = editingId === category.id;
                    const isDeleting = deletingId === category.id;

                    if (isDeleting) {
                      return (
                        <tr key={category.id} className="bg-red-950/20">
                          <td className="px-5 py-3 text-red-200 text-sm font-medium">
                            Delete &ldquo;{category.name}&rdquo;?
                          </td>
                          <td className="px-5 py-3 text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setDeletingId(null)}
                                disabled={isPending}
                                className="h-7 text-xs"
                              >
                                Cancel
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteConfirm(category.id)}
                                disabled={isPending}
                                className="h-7 text-xs bg-red-600 hover:bg-red-700 text-white"
                              >
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    }

                    if (isEditing) {
                      return (
                        <tr key={category.id} className="bg-[#141414]">
                          <td className="px-5 py-2.5">
                            <input
                              ref={editInputRef}
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="w-full px-3 py-1 bg-[#1E2228] text-[#f4f0e1] border border-gray-700 rounded focus:ring-1 focus-visible:ring-[#f4f0e1] text-sm"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleSaveEdit(category.id);
                                } else if (e.key === "Escape") {
                                  e.preventDefault();
                                  setEditingId(null);
                                }
                              }}
                            />
                          </td>
                          <td className="px-5 py-2.5 text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setEditingId(null)}
                                disabled={isPending}
                                className="h-7 text-xs"
                              >
                                Cancel
                              </Button>
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleSaveEdit(category.id)}
                                disabled={isPending || !editName.trim()}
                                className="h-7 text-xs"
                              >
                                Save
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    }

                    return (
                      <tr
                        key={category.id}
                        className="hover:bg-gray-800/30 transition-colors"
                      >
                        <td className="px-5 py-3 text-[#f4f0e1] text-sm font-medium">
                          {category.name}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex justify-end items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingId(category.id);
                                setEditName(category.name);
                              }}
                              title="Edit category name"
                              className="p-1.5 text-gray-400 hover:text-[#f4f0e1] hover:bg-gray-700/50 rounded transition-colors"
                            >
                              <TiPencil className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingId(category.id)}
                              title="Delete category"
                              className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-950/30 rounded transition-colors"
                            >
                              <GoXCircleFill className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <DialogFooter className="pt-3 border-t border-gray-800 mt-2">
          <DialogClose asChild>
            <Button variant="secondary" className="px-6">
              Done
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
