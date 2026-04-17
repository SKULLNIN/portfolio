declare module "js-dos/dist/js-dos.js" {
  export type DosOptions = {
    url: string;
    pathPrefix?: string;
    theme?: string;
    noNetworking?: boolean;
    autoStart?: boolean;
    workerThread?: boolean;
    /** Default false — keep off to avoid pointer-lock issues inside nested windows. */
    mouseCapture?: boolean;
    /** `dosbox` avoids dosbox-x code paths that are heavier / more sensitive on the web. */
    backend?: "dosbox" | "dosboxX";
    onEvent?: (event: string, arg?: unknown) => void;
  };

  export type DosPlayer = {
    stop: () => void | Promise<void>;
    setMouseCapture?: (locked: boolean) => void;
  };

  export type DosFn = (
    element: HTMLElement,
    options: DosOptions,
  ) => Promise<DosPlayer>;

  const Dos: DosFn;
  export { Dos };
  export default Dos;
}

declare module "js-dos/dist/js-dos.css";
