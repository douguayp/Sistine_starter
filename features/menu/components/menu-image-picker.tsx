"use client";

import { useRef, useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import { Button } from "@/components/button";

const MAX_IMAGES = 3;
const MAX_IMAGE_SIZE_BYTES = 8 * 1024 * 1024;

type SelectedImage = {
  id: string;
  name: string;
  size: number;
};

type MenuImagePickerCopy = {
  label: string;
  helper: string;
  choose: string;
  remove: string;
  tooMany: string;
  tooLarge: string;
  imageOnly: string;
};

const defaultCopy: MenuImagePickerCopy = {
  label: "Upload up to 3 menu photos or QR ordering screenshots.",
  helper: "Paper menus, wall menus, WeChat, Alipay, H5 ordering pages, and long screenshots are supported.",
  choose: "Choose images",
  remove: "Remove",
  tooMany: "You can upload up to 3 images.",
  tooLarge: "Each image must be under 8MB.",
  imageOnly: "Only image files are supported.",
};

export function MenuImagePicker({
  copy = defaultCopy,
}: {
  copy?: Partial<MenuImagePickerCopy>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const labels = { ...defaultCopy, ...copy };

  function handleFiles(files: FileList | null) {
    setError(null);

    const nextFiles = Array.from(files ?? []);
    if (nextFiles.length > MAX_IMAGES) {
      setSelectedImages([]);
      setError(labels.tooMany);
      return;
    }

    const invalidType = nextFiles.find((file) => !file.type.startsWith("image/"));
    if (invalidType) {
      setSelectedImages([]);
      setError(labels.imageOnly);
      return;
    }

    const oversized = nextFiles.find((file) => file.size > MAX_IMAGE_SIZE_BYTES);
    if (oversized) {
      setSelectedImages([]);
      setError(labels.tooLarge);
      return;
    }

    setSelectedImages(
      nextFiles.map((file) => ({
        id: `${file.name}-${file.size}-${file.lastModified}`,
        name: file.name,
        size: file.size,
      }))
    );
  }

  function removeImage(id: string) {
    setSelectedImages((current) => current.filter((image) => image.id !== id));
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-4">
      <label
        htmlFor="menu-images"
        className="block text-sm font-medium text-foreground"
      >
        {labels.label}
      </label>
      <p className="text-sm leading-6 text-muted-foreground">{labels.helper}</p>

      <input
        ref={inputRef}
        id="menu-images"
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        className="sr-only"
        onChange={(event) => handleFiles(event.target.files)}
      />

      <Button
        type="button"
        variant="simple"
        onClick={() => inputRef.current?.click()}
        className="inline-flex items-center gap-2"
      >
        <ImagePlus className="h-4 w-4" />
        {labels.choose}
      </Button>

      {error && (
        <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      {selectedImages.length > 0 && (
        <ul className="grid gap-3 sm:grid-cols-3">
          {selectedImages.map((image) => (
            <li
              key={image.id}
              className="rounded-lg border border-border bg-card p-3"
            >
              <div className="flex aspect-[4/3] items-center justify-center rounded-md bg-secondary text-muted-foreground">
                <ImagePlus className="h-6 w-6" />
              </div>
              <div className="mt-3 flex items-start justify-between gap-2">
                <div>
                  <p className="break-all text-sm font-medium text-foreground">{image.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {(image.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeImage(image.id)}
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                  aria-label={`${labels.remove} ${image.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
