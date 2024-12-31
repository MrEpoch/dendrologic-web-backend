"use client";

import React from "react";
import {
  Item,
  SortableList,
  SortableListItem,
} from "@/components/ui/sortable-list";
import { Plus, RepeatIcon } from "lucide-react";
import Link from "next/link";

export function SortableListRequests({ georequests }) {
  const [items, setItems] = React.useState<Item[]>(
    georequests.map((georequest, i) => {
      return {
        text: georequest.requestName,
        checked: false,
        id: i + 1,
        link: georequest.id,
      };
    }),
  );

  const handleCompleteItem = (id: number) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item,
      ),
    );
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
    onDeleteItem: (id: string) => void,
  ) => {
    return (
      <SortableListItem
        item={item}
        order={order}
        key={item.id}
        onCompleteItem={onCompleteItem}
        onDeleteItem={onDeleteItem}
        handleDrag={handleCloseOnDrag}
        className="my-2 "
      />
    );
  };

  async function deleteItem(link: string) {
    try {
      const response = await fetch(`/api/geojson/requests/${link}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log(response);
      const data = await response.json();
      console.log(data);
    } catch (e) {
      console.log(e);
    }
  }

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
                <button>
                  <RepeatIcon className="h-4 w-4 text-main-text-200 hover:text-main-text-100" />
                </button>
              </div>
            </div>
            <SortableList
              items={items}
              setItems={setItems}
              onCompleteItem={handleCompleteItem}
              renderItem={renderListItem}
              deleteItem={deleteItem}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
