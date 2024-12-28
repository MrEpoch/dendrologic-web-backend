"use client";

import React from "react";
import {
  Item,
  SortableList,
  SortableListItem,
} from "@/components/ui/sortable-list";
import { Plus, RepeatIcon } from "lucide-react";
import Link from "next/link";

const initialState = [
  {
    text: "Gather Data",
    checked: false,
    id: 1,
    description:
      "Collect relevant marketing copy from the user's website and competitor sites to understand the current market positioning and identify potential areas for improvement.",
  },
  {
    text: "Analyze Copy",
    checked: false,
    id: 2,
    description:
      "As an AI language model, analyze the collected marketing copy for clarity, persuasiveness, and alignment with the user's brand voice and target audience. Identify strengths, weaknesses, and opportunities for optimization.",
  },
  {
    text: "Create Suggestions",
    checked: false,
    id: 3,
    description:
      "Using natural language generation techniques, create alternative versions of the marketing copy that address the identified weaknesses and leverage the opportunities for improvement. Ensure the generated copy is compelling, on-brand, and optimized for the target audience.",
  },
  {
    text: "Recommendations",
    checked: false,
    id: 5,
    description:
      "Present the AI-generated marketing copy suggestions to the user, along with insights on why these changes were recommended. Provide a user-friendly interface for the user to review, edit, and implement the optimized copy on their website.",
  },
];

export function SortableListRequests() {
  const [items, setItems] = React.useState<Item[]>(initialState);

  const handleCompleteItem = (id: number) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item,
      ),
    );
  };

  const handleAddItem = () => {
    setItems((prevItems) => [
      ...prevItems,
      {
        text: `Item ${prevItems.length + 1}`,
        checked: false,
        id: Date.now(),
        description: "",
      },
    ]);
  };

  const handleResetItems = () => {
    setItems(initialState);
  };

  const handleCloseOnDrag = React.useCallback(() => {
    setItems((prevItems) => {
      const updatedItems = prevItems.map((item) =>
        item.checked ? { ...item, checked: false } : item,
      );
      return updatedItems.some(
        (item, index) => item.checked !== prevItems[index].checked,
      )
        ? updatedItems
        : prevItems;
    });
  }, []);

  const renderListItem = (
    item: Item,
    order: number,
    onCompleteItem: (id: number) => void,
    onRemoveItem: (id: number) => void,
  ) => {
    return (
      <SortableListItem
        item={item}
        order={order}
        key={item.id}
        onCompleteItem={onCompleteItem}
        onRemoveItem={onRemoveItem}
        handleDrag={handleCloseOnDrag}
        className="my-2 "
      />
    );
  };

  return (
    <div className="w-full">
      <div className="mb-9 rounded-2xl  p-2 shadow-sm md:p-6 bg-main-background-200 w-full">
        <div className=" overflow-auto p-1  md:p-4">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between gap-4 py-2">
              <Link href="/auth/dashboard/requests/create">
                <Plus className="dark:text-netural-100 h-5 w-5 text-main-text-200 hover:text-main-text-100" />
              </Link>
              <div data-tip="Reset task list">
                <button onClick={handleResetItems}>
                  <RepeatIcon className="h-4 w-4 text-main-text-200 hover:text-main-text-100" />
                </button>
              </div>
            </div>
            <SortableList
              items={items}
              setItems={setItems}
              onCompleteItem={handleCompleteItem}
              renderItem={renderListItem}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
