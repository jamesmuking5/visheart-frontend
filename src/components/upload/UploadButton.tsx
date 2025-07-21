import React from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface UploadButtonProps extends Omit<ButtonProps, "onClick"> {
  onUploadClick: () => void;
  text?: string;
  icon?: boolean;
}

export function UploadButton({
  onUploadClick,
  text = "Upload New Project",
  icon = true,
  className,
  ...props
}: UploadButtonProps) {
  return (
    <Button onClick={onUploadClick} className={className} {...props}>
      {icon && <Upload className="mr-2 h-4 w-4" />}
      {text}
    </Button>
  );
}
