import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { ImagePickerAsset } from "expo-image-picker";

interface UseStorageProps {
  file: ImagePickerAsset;
  type: string;
}

export const useStorage = () => {
  const generateUploadUrl = useMutation(api.general.generateUploadURL);

  const uploadFile = async ({ file, type }: UseStorageProps) => {
    try {
      const uploadUr = await generateUploadUrl();

      const response = await fetch(file.uri);

      const blob = await response.blob();

      const postResult = await fetch(uploadUr, {
        method: "POST",
        headers: {
          "Content-Type": file.mimeType!,
        },
        body: blob,
      });

      const { storageId } = await postResult.json();

      return { storageId };
    } catch (error) {
      console.log(error);
    }
  };

  return { uploadFile };
};
