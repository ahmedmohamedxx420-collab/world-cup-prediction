"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Avatar } from "@/components/ui/avatar";
import { BallLoader } from "@/components/ball-loader";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

type UploadError = "image" | "upload" | "generic";

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
) {
  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, type, quality);
  });
}

async function loadImage(file: File) {
  if ("createImageBitmap" in window) {
    const bitmap = await createImageBitmap(file);
    return {
      width: bitmap.width,
      height: bitmap.height,
      draw: (
        context: CanvasRenderingContext2D,
        sx: number,
        sy: number,
        side: number,
        size: number,
      ) => context.drawImage(bitmap, sx, sy, side, side, 0, 0, size, size),
      close: () => bitmap.close(),
    };
  }

  const url = URL.createObjectURL(file);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Could not load image."));
      img.src = url;
    });

    return {
      width: image.naturalWidth,
      height: image.naturalHeight,
      draw: (
        context: CanvasRenderingContext2D,
        sx: number,
        sy: number,
        side: number,
        size: number,
      ) => context.drawImage(image, sx, sy, side, side, 0, 0, size, size),
      close: () => URL.revokeObjectURL(url),
    };
  } catch (error) {
    URL.revokeObjectURL(url);
    throw error;
  }
}

async function resizeAvatar(file: File) {
  const image = await loadImage(file);
  const size = 512;
  const side = Math.min(image.width, image.height);
  const sx = Math.max(0, Math.floor((image.width - side) / 2));
  const sy = Math.max(0, Math.floor((image.height - side) / 2));
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const context = canvas.getContext("2d");
  if (!context) {
    image.close();
    throw new Error("Canvas is unavailable.");
  }

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  image.draw(context, sx, sy, side, size);
  image.close();

  const webp = await canvasToBlob(canvas, "image/webp", 0.82);
  if (webp) return new File([webp], "avatar.webp", { type: "image/webp" });

  const jpeg = await canvasToBlob(canvas, "image/jpeg", 0.86);
  if (!jpeg) throw new Error("Could not encode image.");

  return new File([jpeg], "avatar.jpg", { type: "image/jpeg" });
}

export function AvatarUpload({
  name = "avatarUrl",
  fullName,
  initialUrl,
  onUploadingChange,
}: {
  name?: string;
  fullName: string;
  initialUrl?: string | null;
  onUploadingChange?: (uploading: boolean) => void;
}) {
  const [avatarUrl, setAvatarUrl] = useState(initialUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<UploadError>();
  const [avatarDirty, setAvatarDirty] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const t = useTranslations("avatar");

  useEffect(() => {
    onUploadingChange?.(uploading);
  }, [onUploadingChange, uploading]);

  const handleChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("image");
      return;
    }

    setUploading(true);
    setError(undefined);

    try {
      const resized = await resizeAvatar(file);
      const supabase = createClient();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) throw userError ?? new Error("No user.");

      const path = `${user.id}/avatar.webp`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, resized, {
          cacheControl: "31536000",
          contentType: resized.type,
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      const separator = data.publicUrl.includes("?") ? "&" : "?";
      setAvatarUrl(`${data.publicUrl}${separator}v=${Date.now()}`);
      setAvatarDirty(true);
    } catch {
      setError("upload");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={inputId}>{t("label")}</Label>
      <div className="flex items-center gap-3">
        <Avatar
          src={avatarUrl || null}
          name={fullName}
          alt={fullName ? t("previewAlt", { name: fullName }) : ""}
          className="size-16 text-lg ring-2 ring-lime/40"
        />

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap gap-2">
            <input
              ref={inputRef}
              id={inputId}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleChange}
              disabled={uploading}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <BallLoader variant="inline" />
              ) : (
                <ImagePlus aria-hidden />
              )}
              <span>
                {uploading
                  ? t("uploading")
                  : avatarUrl
                    ? t("change")
                    : t("choose")}
              </span>
            </Button>

            {avatarUrl ? (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setAvatarUrl("");
                  setAvatarDirty(true);
                  setError(undefined);
                }}
                disabled={uploading}
              >
                <Trash2 aria-hidden />
                <span>{t("remove")}</span>
              </Button>
            ) : null}
          </div>

          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {t(`errors.${error}`)}
            </p>
          ) : avatarDirty && avatarUrl ? (
            <p className="text-sm text-muted-foreground">
              {t("ready")}
            </p>
          ) : null}
        </div>
      </div>

      <input type="hidden" name={name} value={avatarUrl} />
    </div>
  );
}
