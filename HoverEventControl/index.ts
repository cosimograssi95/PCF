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
  private selectedGallery: HTMLDivElement | null = null;
  private refreshTrigger: boolean;
  private EnterOutput: boolean = false;
  private LeaveOutput: boolean = false;
  private index: string | null = "0";
  private controlX: number = 0;
  private controlY: number = 0;
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
    this.startControlRefresh();
  }

  private updateProperties(context: ComponentFramework.Context<IInputs>): void {
    this.controlName = context.parameters.controlName.raw || "";
    this.enterDelay = context.parameters.enterDelay.raw || 0;
    this.leaveDelay = context.parameters.leaveDelay.raw || 0;
    this.refreshTrigger = context.parameters.refreshTrigger.raw;
    this.enableEnterDelay = context.parameters.enableEnterDelay.raw;
    this.enableLeaveDelay = context.parameters.enableLeaveDelay.raw;
  }

  private bindEventHandlers(): void {
    this.onMouseEnterBind = this.onMouseEnter.bind(this);
    this.onMouseLeaveBind = this.onMouseLeave.bind(this);
    this.onScrollBind = this.onGalleryScroll.bind(this);
  }

  private startControlRefresh(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }

    this.refreshTimer = setInterval(() => {
      if (this.isDestroyed) {
        if (this.refreshTimer) {
          clearInterval(this.refreshTimer);
          this.refreshTimer = null;
        }
        return;
      }

      this.refreshControls();
    }, 100);
  }

  private refreshControls(): void {
    const newControls = document.querySelectorAll(
      `[data-control-name='${this.controlName}']`
    );

    // Only update if controls have changed
    if (
      newControls.length !== this.selectedControls?.length ||
      newControls.length === 0
    ) {
      this.selectedControls = newControls;

      if (newControls.length > 0) {
        this.attachEventListeners();
        this.setupGalleryScrollListener();

        // Stop refresh timer once controls are found and attached
        if (this.refreshTimer) {
          clearInterval(this.refreshTimer);
          this.refreshTimer = null;
        }
      }
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
        this.selectedGallery = firstControl.parentElement?.closest(
          "[aria-label]"
        ) as HTMLDivElement;

        if (this.selectedGallery) {
          this.selectedGallery.addEventListener("scroll", this.onScrollBind);
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

        const parent = target.closest("[aria-posinset]");
        this.index = parent?.getAttribute("aria-posinset") || "0";

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

      this.detachEventListeners();
      this.selectedControls = document.querySelectorAll(
        `[data-control-name='${this.controlName}']`
      );
      this.attachEventListeners();
    }, 100);
  }

  private resetPosition(): void {
    this.index = "0";
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
      context.parameters.refreshTrigger.raw !== this.refreshTrigger ||
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
      index: Number(this.index),
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

    if (this.selectedGallery) {
      this.selectedGallery.removeEventListener("scroll", this.onScrollBind);
      this.selectedGallery = null;
    }
  }
}
