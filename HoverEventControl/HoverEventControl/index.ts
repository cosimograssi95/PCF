import { IInputs, IOutputs } from "./generated/ManifestTypes";

export class HoverEventControl
  implements ComponentFramework.StandardControl<IInputs, IOutputs>
{
  private notifyOutputChanged: () => void;
  private controlName: string;
  private enterDelay: number;
  private leaveDelay: number;
  private enableEnterDelay: boolean;
  private enableLeaveDelay: boolean;
  private onMouseEnterBind: (e: Event) => void;
  private onMouseLeaveBind: (e: Event) => void;
  private onScrollBind: (e: Event) => void;
  private enterTimer: ReturnType<typeof setTimeout> | null = null;
  private leaveTimer: ReturnType<typeof setTimeout> | null = null;
  private scrollTimer: ReturnType<typeof setTimeout> | null = null;
  private refreshTimer: ReturnType<typeof setInterval> | null = null;
  private selectedControls: NodeList;
  private selectedInnerGallery: HTMLDivElement | null = null;
  private selectedOuterGallery: HTMLDivElement | null = null;
  private EnterOutput: boolean = false;
  private LeaveOutput: boolean = false;
  private innerGalleryIndex: string | null = "0";
  private outerGalleryIndex: string | null = "0";
  private controlX: number = 0;
  private controlY: number = 0;
  private observer: MutationObserver | null = null;
  private isDestroyed: boolean = false;

  constructor() {}

  public init(
    context: ComponentFramework.Context<IInputs>,
    notifyOutputChanged: () => void,
    state: ComponentFramework.Dictionary,
    container: HTMLDivElement
  ): void {
    this.notifyOutputChanged = notifyOutputChanged;
    this.updateProperties(context);
    this.bindEventHandlers();
    this.attachListenersToExistingControls();
    this.startMutationObserver();
  }

  private updateProperties(context: ComponentFramework.Context<IInputs>): void {
    this.controlName = context.parameters.controlName.raw || "";
    this.enterDelay = context.parameters.enterDelay.raw || 0;
    this.leaveDelay = context.parameters.leaveDelay.raw || 0;
    this.enableEnterDelay = context.parameters.enableEnterDelay.raw;
    this.enableLeaveDelay = context.parameters.enableLeaveDelay.raw;
  }

  private bindEventHandlers(): void {
    this.onMouseEnterBind = this.onMouseEnter.bind(this);
    this.onMouseLeaveBind = this.onMouseLeave.bind(this);
    this.onScrollBind = this.onGalleryScroll.bind(this);
  }

  private attachListenersToExistingControls(): void {
    const controls = document.querySelectorAll(
      `[data-control-name='${this.controlName}']`
    );
    controls.forEach((control) => this.attachEventListenerToElement(control));
  }

  private startMutationObserver(): void {
    if (this.observer) {
      this.observer.disconnect();
    }

    this.observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (
            node instanceof HTMLElement &&
            node.hasAttribute("data-control-name") &&
            node.getAttribute("data-control-name") === this.controlName
          ) {
            this.attachEventListenerToElement(node);
          }

          if (node instanceof HTMLElement) {
            const descendants = node.querySelectorAll(
              `[data-control-name='${this.controlName}']`
            );
            descendants.forEach((el) => this.attachEventListenerToElement(el));
          }
        });
      }
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  private attachEventListenerToElement(element: Element): void {
    if (element instanceof HTMLElement) {
      element.removeEventListener("mouseenter", this.onMouseEnterBind);
      element.removeEventListener("mouseleave", this.onMouseLeaveBind);
      element.addEventListener("mouseenter", this.onMouseEnterBind);
      element.addEventListener("mouseleave", this.onMouseLeaveBind);
    }
  }

  private attachEventListeners(): void {
    if (!this.selectedControls) return;

    for (const control of Array.from(this.selectedControls)) {
      control.addEventListener("mouseenter", this.onMouseEnterBind);
      control.addEventListener("mouseleave", this.onMouseLeaveBind);
    }
  }

  private detachEventListeners(): void {
    if (!this.selectedControls) return;

    for (const control of Array.from(this.selectedControls)) {
      control.removeEventListener("mouseenter", this.onMouseEnterBind);
      control.removeEventListener("mouseleave", this.onMouseLeaveBind);
    }
  }

  private setupGalleryScrollListener(): void {
    if (this.selectedControls.length > 1) {
      const firstControl = document.querySelector(
        `[data-control-name='${this.controlName}']`
      ) as HTMLDivElement;

      if (firstControl) {
        this.selectedInnerGallery = firstControl.parentElement?.closest(
          ".virtualized-gallery[role='list'][data-control-part='gallery-window']"
        ) as HTMLDivElement;

        if (this.selectedInnerGallery) {
          this.selectedInnerGallery.addEventListener(
            "scroll",
            this.onScrollBind
          );

          this.selectedOuterGallery =
            this.selectedInnerGallery.parentElement?.closest(
              ".virtualized-gallery[role='list'][data-control-part='gallery-window']"
            ) as HTMLDivElement;

          if (this.selectedOuterGallery) {
            this.selectedOuterGallery.addEventListener(
              "scroll",
              this.onScrollBind
            );
          }
        }
      }
    }
  }

  private clearTimers(): void {
    if (this.enterTimer) {
      clearTimeout(this.enterTimer);
      this.enterTimer = null;
    }
    if (this.leaveTimer) {
      clearTimeout(this.leaveTimer);
      this.leaveTimer = null;
    }
    if (this.scrollTimer) {
      clearTimeout(this.scrollTimer);
      this.scrollTimer = null;
    }
  }

  private onMouseEnter(event: Event): void {
    this.clearTimers();

    this.enterTimer = setTimeout(
      () => {
        if (this.isDestroyed) return;

        this.EnterOutput = true;
        this.LeaveOutput = false;

        const target = event.target as HTMLDivElement;
        const rect = target.getBoundingClientRect();
        this.controlX = rect.x;
        this.controlY = rect.y;

        const innerParent = target.closest(
          '[aria-posinset][role="listitem"][data-control-part="gallery-item"]'
        );

        this.innerGalleryIndex =
          innerParent?.getAttribute("aria-posinset") || "0";
        const outerParent = innerParent?.parentElement?.closest(
          '[aria-posinset][role="listitem"][data-control-part="gallery-item"]'
        );

        this.outerGalleryIndex =
          outerParent?.getAttribute("aria-posinset") || "0";

        this.enterTimer = null;
        this.notifyOutputChanged();
      },
      this.enableEnterDelay ? this.enterDelay : 0
    );
  }

  private onMouseLeave(event: Event): void {
    if (this.enterTimer) {
      clearTimeout(this.enterTimer);
      this.enterTimer = null;
    }

    this.leaveTimer = setTimeout(
      () => {
        if (this.isDestroyed) return;

        if (this.EnterOutput && !this.LeaveOutput) {
          this.EnterOutput = false;
          this.LeaveOutput = true;
          this.resetPosition();
          this.notifyOutputChanged();
        }
      },
      this.enableLeaveDelay ? this.leaveDelay : 0
    );
  }

  private onGalleryScroll(event: Event): void {
    const retryInterval = 100;
    if (this.EnterOutput || this.LeaveOutput) {
      this.EnterOutput = false;
      this.LeaveOutput = false;
      this.resetPosition();
      this.notifyOutputChanged();
    }

    if (this.scrollTimer) {
      clearTimeout(this.scrollTimer);
    }

    this.scrollTimer = setTimeout(() => {
      if (this.isDestroyed) return;

      let retries = 0;
      const maxRetries = 10;

      const tryRefresh = () => {
        const controls = document.querySelectorAll(
          `[data-control-name='${this.controlName}']`
        );

        if (controls.length > 0) {
          this.detachEventListeners();
          this.selectedControls = controls;
          this.attachEventListeners();
          return;
        }

        retries++;
        if (retries < maxRetries) {
          setTimeout(tryRefresh, retryInterval);
        }
      };

      tryRefresh();
    }, retryInterval);
  }

  private resetPosition(): void {
    this.innerGalleryIndex = "0";
    this.outerGalleryIndex = "0";
    this.controlX = 0;
    this.controlY = 0;
  }

  private hasParametersChanged(
    context: ComponentFramework.Context<IInputs>
  ): boolean {
    return (
      context.parameters.controlName.raw !== this.controlName ||
      context.parameters.enterDelay.raw !== this.enterDelay ||
      context.parameters.leaveDelay.raw !== this.leaveDelay ||
      context.parameters.enableEnterDelay.raw !== this.enableEnterDelay ||
      context.parameters.enableLeaveDelay.raw !== this.enableLeaveDelay
    );
  }

  public updateView(context: ComponentFramework.Context<IInputs>): void {
    if (this.hasParametersChanged(context)) {
      this.detachEventListeners();
      this.updateProperties(context);

      this.selectedControls = document.querySelectorAll(
        `[data-control-name='${this.controlName}']`
      );

      this.setupGalleryScrollListener();
      this.resetPosition();
      this.attachEventListeners();
    }
  }

  public getOutputs(): IOutputs {
    return {
      hasEntered: this.EnterOutput,
      hasLeft: this.LeaveOutput,
      innerGalleryIndex: Number(this.innerGalleryIndex),
      outerGalleryIndex: Number(this.outerGalleryIndex),
      controlX: this.controlX,
      controlY: this.controlY,
    };
  }

  public destroy(): void {
    this.isDestroyed = true;
    this.clearTimers();

    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }

    this.detachEventListeners();

    if (this.selectedInnerGallery) {
      this.selectedInnerGallery.removeEventListener(
        "scroll",
        this.onScrollBind
      );
      this.selectedInnerGallery = null;
    }

    if (this.selectedOuterGallery) {
      this.selectedOuterGallery.removeEventListener(
        "scroll",
        this.onScrollBind
      );
      this.selectedOuterGallery = null;
    }
  }
}
