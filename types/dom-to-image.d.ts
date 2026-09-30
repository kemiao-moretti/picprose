declare module "dom-to-image" {
  interface DomToImageOptions {
    height?: number;
    width?: number;
    style?: Record<string, string>;
    quality?: number;
  }

  interface DomToImageApi {
    toJpeg(node: HTMLElement, options?: DomToImageOptions): Promise<string>;
    toPng(node: HTMLElement, options?: DomToImageOptions): Promise<string>;
    toSvg(node: HTMLElement, options?: DomToImageOptions): Promise<string>;
  }

  const domtoimage: DomToImageApi;
  export default domtoimage;
}
