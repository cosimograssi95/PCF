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
  private enterTimer: ReturnType<typeof setTimeout> | null;
  private leaveTimer: ReturnType<typeof setTimeout> | null;
  private scrollTimer: ReturnType<typeof setTimeout> | null;
  private refreshTimer: ReturnType<typeof setInterval>;
  private selectedControl: NodeList;
  private selectedGallery: HTMLDivElement;
  private refreshTrigger: boolean;
  private EnterOutput: boolean = false;
  private LeaveOutput: boolean = false;
  private index: string | null = "0";
  private controlX: number;
  private controlY: number;
  constructor() {}

  public init(
    context: ComponentFramework.Context<IInputs>,
    notifyOutputChanged: () => void,
    state: ComponentFramework.Dictionary,
    container: HTMLDivElement
  ): void {
    this.notifyOutputChanged = notifyOutputChanged;
    this.controlName = context.parameters.controlName.raw || "";
    this.enterDelay = context.parameters.enterDelay.raw || 0;
    this.leaveDelay = context.parameters.leaveDelay.raw || 0;
    this.refreshTrigger = context.parameters.refreshTrigger.raw;
    this.enableEnterDelay = context.parameters.enableEnterDelay.raw;
    this.enableLeaveDelay = context.parameters.enableLeaveDelay.raw;
    this.onMouseEnterBind = this.onMouseEnter.bind(this);
    this.onMouseLeaveBind = this.onMouseLeave.bind(this);
    this.onScrollBind = this.onGalleryScroll.bind(this);

    this.selectedControl = document.querySelectorAll(
      "[data-control-name='" + this.controlName + "']"
    );
    this.refreshTimer = setInterval(() => {
      if (this.selectedControl.length !== 0) {
        this.selectedControl = document.querySelectorAll(
          "[data-control-name='" + this.controlName + "']"
        );
        for (let i = 0; i < this.selectedControl.length; i++) {
          this.selectedControl[i].addEventListener(
            "mouseenter",
            this.onMouseEnter.bind(this)
          );

          this.selectedControl[i].addEventListener(
            "mouseleave",
            this.onMouseLeave.bind(this)
          );
          if (this.selectedControl.length > 1) {
            this.selectedGallery = (
              document.querySelector(
                "[data-control-name='" + this.controlName + "']"
              ) as HTMLDivElement
            ).parentElement?.closest("[aria-label]") as HTMLDivElement;
            this.selectedGallery.addEventListener(
              "scroll",
              this.onGalleryScroll.bind(this)
            );
          }
          clearInterval(this.refreshTimer);
        }
      } else {
        this.selectedControl = document.querySelectorAll(
          "[data-control-name='" + this.controlName + "']"
        );
      }
    }, 100);
  }

  private onMouseEnter(event: Event): void {
    if (this.leaveTimer != null) {
      clearTimeout(this.leaveTimer);
      this.leaveTimer = null;
    }
    this.enterTimer = setTimeout(
      () => {
        this.EnterOutput = true;
        this.LeaveOutput = false;
        const e = event.target as HTMLDivElement;
        this.controlX = e.getBoundingClientRect().x;
        this.controlY = e.getBoundingClientRect().y;
        const parent = e.closest("[aria-posinset]");
        if (parent) {
          this.index = parent.getAttribute("aria-posinset")
            ? parent.getAttribute("aria-posinset")
            : "0";
        }
        this.enterTimer = null;
        this.notifyOutputChanged();
      },
      this.enableEnterDelay ? this.enterDelay : 0
    );
  }

  private onMouseLeave(event: Event): void {
    if (this.enterTimer != null) {
      clearTimeout(this.enterTimer);
      this.enterTimer = null;
    }
    this.leaveTimer = setTimeout(
      () => {
        if (this.EnterOutput && !this.LeaveOutput) {
          this.EnterOutput = false;
          this.LeaveOutput = true;
          this.index = "0";
          this.controlX = 0;
          this.controlY = 0;
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
      this.index = "0";
      this.controlX = 0;
      this.controlY = 0;
      this.notifyOutputChanged();
    }
    if (this.scrollTimer !== null) {
      clearTimeout(this.scrollTimer);
    }
    this.scrollTimer = setTimeout(() => {
      for (let i = 0; i < this.selectedControl.length; i++) {
        this.selectedControl[i].removeEventListener(
          "mouseenter",
          this.onMouseEnterBind
        );
        this.selectedControl[i].removeEventListener(
          "mouseleave",
          this.onMouseLeaveBind
        );
      }
      this.selectedControl = document.querySelectorAll(
        "[data-control-name='" + this.controlName + "']"
      );
      for (let i = 0; i < this.selectedControl.length; i++) {
        this.selectedControl[i].addEventListener(
          "mouseenter",
          this.onMouseEnterBind
        );
        this.selectedControl[i].addEventListener(
          "mouseleave",
          this.onMouseLeaveBind
        );
      }
    }, 100);
  }

  public updateView(context: ComponentFramework.Context<IInputs>): void {
    if (
      context.parameters.controlName.raw !== this.controlName ||
      context.parameters.enterDelay.raw !== this.enterDelay ||
      context.parameters.leaveDelay.raw !== this.leaveDelay ||
      context.parameters.refreshTrigger.raw !== this.refreshTrigger ||
      context.parameters.enableEnterDelay.raw !== this.enableEnterDelay ||
      context.parameters.enableLeaveDelay.raw !== this.enableLeaveDelay
    ) {
      for (let i = 0; i < this.selectedControl.length; i++) {
        this.selectedControl[i].removeEventListener(
          "mouseenter",
          this.onMouseEnterBind
        );
        this.selectedControl[i].removeEventListener(
          "mouseleave",
          this.onMouseLeaveBind
        );
      }
      this.controlName = context.parameters.controlName.raw || "";
      this.enterDelay = context.parameters.enterDelay.raw || 0;
      this.leaveDelay = context.parameters.leaveDelay.raw || 0;
      this.enableEnterDelay = context.parameters.enableEnterDelay.raw;
      this.enableLeaveDelay = context.parameters.enableLeaveDelay.raw;
      this.refreshTrigger = context.parameters.refreshTrigger.raw;
      this.selectedControl = document.querySelectorAll(
        "[data-control-name='" + this.controlName + "']"
      );
      if (this.selectedControl.length > 1) {
        this.selectedGallery = (
          document.querySelector(
            "[data-control-name='" + this.controlName + "']"
          ) as HTMLDivElement
        ).parentElement?.closest("[aria-label]") as HTMLDivElement;

        this.selectedGallery.addEventListener("scroll", this.onScrollBind);
      }
      this.index = "0";

      for (let i = 0; i < this.selectedControl.length; i++) {
        this.selectedControl[i].addEventListener(
          "mouseenter",
          this.onMouseEnterBind
        );

        this.selectedControl[i].addEventListener(
          "mouseleave",
          this.onMouseLeaveBind
        );
      }
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
    for (let i = 0; i < this.selectedControl.length; i++) {
      this.selectedControl[i].removeEventListener(
        "mouseenter",
        this.onMouseEnterBind
      );
      this.selectedControl[i].removeEventListener(
        "mouseleave",
        this.onMouseLeaveBind
      );
    }
    this.selectedGallery.removeEventListener("scroll", this.onGalleryScroll);
  }
}
