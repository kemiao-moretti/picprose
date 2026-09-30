import React from "react";
import domtoimage from "dom-to-image";

export type ImageFormat = "jpg" | "png" | "svg";

export interface ComponentToImgHandle {
  downloadImage: (format: ImageFormat) => void;
}

interface ComponentToImgProps {
  children: React.ReactNode;
}

interface DomToImageConfig {
  height: number;
  width: number;
  style: {
    transform: string;
    transformOrigin: string;
    width: string;
    height: string;
  };
  quality: number;
}

export const ComponentToImg = React.forwardRef<
  ComponentToImgHandle,
  ComponentToImgProps
>((props, ref) => {
  const componentRef = React.useRef<HTMLDivElement>(null);

  const getCurrentTimeForFileName = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, "0");
    const day = now.getDate().toString().padStart(2, "0");
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const seconds = now.getSeconds().toString().padStart(2, "0");
    return `${year}-${month}-${day}-${hours}-${minutes}-${seconds}`;
  };

  const saveImage = (data: string) => {
    const a = document.createElement("a");
    a.href = data;
    a.download = getCurrentTimeForFileName();
    document.body.appendChild(a);

    a.click();
    document.body.removeChild(a);
  };

  const downloadImage = async (imgFormat: ImageFormat) => {
    const element = componentRef.current;

    if (!element) {
      return;
    }

    const scale = 1.6;
    const config: DomToImageConfig = {
      height: element.offsetHeight * scale,
      width: element.offsetWidth * scale,
      style: {
        transform: "scale(" + scale + ")",
        transformOrigin: "top left",
        width: element.offsetWidth + "px",
        height: element.offsetHeight + "px",
      },
      quality: 0.92,
    };

    if (imgFormat === "jpg") {
      const data = await domtoimage.toJpeg(element, config);
      saveImage(data);
    } else if (imgFormat === "png") {
      const data = await domtoimage.toPng(element, config);
      saveImage(data);
    } else {
      const data = await domtoimage.toSvg(element, config);
      saveImage(data);
    }
  };

  React.useImperativeHandle(ref, () => ({
    downloadImage: (imgFormat: ImageFormat) => {
      void downloadImage(imgFormat);
    },
  }));

  return <div ref={componentRef}>{props.children}</div>;
});

ComponentToImg.displayName = "ComponentToImg";
