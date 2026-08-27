import type {LegoSet} from "@/types";
import {collectionInsert} from "@/lib/api.ts";
import {toast} from "@/components/ui/toast.tsx";

type AddToCollectionProps = {
    legoSet: LegoSet;
    onClose: () => void;
};

export const addToCollection = async ({legoSet, onClose}: AddToCollectionProps) => {
    let toastType = ""
    let toastDescription = ""
    try {
        const { data, error } = await collectionInsert(legoSet.id);
        if (error) {
            toastType = "error";
            toastDescription = "Failed to add set to collection";
        } else if (data) {
            toastType = "success";
            toastDescription = "Successfully added set to collection";
            onClose();
        }
    } catch {
        toastType = "error";
        toastDescription = "Failed to add set to collection";
    } finally {
        toast.add({type: toastType, description: toastDescription});
    }
}