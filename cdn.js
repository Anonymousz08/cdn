// LumeButton.js - Fixed Hover/Active States Version

export class LumeButton extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    // Bind methods
    this.handleClick = this.handleClick.bind(this);
    this.createRipple = this.createRipple.bind(this);
    this.handleKeydown = this.handleKeydown.bind(this);

    // Internal state
    this._initialized = false;
    this._rippleCleanup = null;
  }

  static get observedAttributes() {
    return [
      "variant",
      "size",
      "disabled",
      "href",
      "target",
      "color",
      "bg-color",
      "hover-color",
      "hover-bg-color",
      "active-color",
      "active-bg-color",
      "border",
      "radius",
      "padding",
      "font-size",
      "font-weight",
      "width",
      "height",
      "glow-color",
      "shadow",
      "onclick-handler",
      "loading",
      "full-width",
    ];
  }

  connectedCallback() {
    this._upgradeProperties();
    this.render();
    this.setupEventListeners();
    this._initialized = true;
  }

  disconnectedCallback() {
    this.removeEventListeners();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (this._initialized && oldValue !== newValue) {
      this.render();
    }
  }

  // Property getters with validation and defaults
  get variant() {
    const value = this.getAttribute("variant") || "primary";
    const validVariants = [
      "primary",
      "secondary",
      "outlined",
      "ghost",
      "glow",
      "icon-btn",
      "link",
    ];
    return validVariants.includes(value) ? value : "primary";
  }

  get size() {
    const value = this.getAttribute("size") || "medium";
    const validSizes = ["small", "medium", "large"];
    return validSizes.includes(value) ? value : "medium";
  }

  get disabled() {
    return this.hasAttribute("disabled");
  }

  get loading() {
    return this.hasAttribute("loading");
  }

  get fullWidth() {
    return this.hasAttribute("full-width");
  }

  get href() {
    return this.getAttribute("href");
  }

  get target() {
    const value = this.getAttribute("target") || "_self";
    const validTargets = ["_self", "_blank", "_parent", "_top"];
    return validTargets.includes(value) ? value : "_self";
  }

  // Style property getters
  get color() {
    return this.getAttribute("color");
  }
  get bgColor() {
    return this.getAttribute("bg-color");
  }
  get hoverColor() {
    return this.getAttribute("hover-color");
  }
  get hoverBgColor() {
    return this.getAttribute("hover-bg-color");
  }
  get activeColor() {
    return this.getAttribute("active-color");
  }
  get activeBgColor() {
    return this.getAttribute("active-bg-color");
  }
  get border() {
    return this.getAttribute("border");
  }
  get radius() {
    return this.getAttribute("radius");
  }
  get padding() {
    return this.getAttribute("padding");
  }
  get fontSize() {
    return this.getAttribute("font-size");
  }
  get fontWeight() {
    return this.getAttribute("font-weight");
  }
  get width() {
    return this.getAttribute("width");
  }
  get height() {
    return this.getAttribute("height");
  }
  get glowColor() {
    return this.getAttribute("glow-color");
  }
  get shadow() {
    return this.getAttribute("shadow");
  }
  get onclickHandler() {
    return this.getAttribute("onclick-handler");
  }

  // Property setters with proper reflection
  set variant(value) {
    this.setAttribute("variant", value);
  }
  set size(value) {
    this.setAttribute("size", value);
  }
  set disabled(value) {
    if (value) this.setAttribute("disabled", "");
    else this.removeAttribute("disabled");
  }
  set loading(value) {
    if (value) this.setAttribute("loading", "");
    else this.removeAttribute("loading");
  }
  set href(value) {
    if (value) this.setAttribute("href", value);
    else this.removeAttribute("href");
  }

  // Upgrade properties that might have been set before element definition
  _upgradeProperties() {
    this.constructor.observedAttributes.forEach((prop) => {
      if (this.hasOwnProperty(prop)) {
        const value = this[prop];
        delete this[prop];
        this[prop] = value;
      }
    });
  }

  setupEventListeners() {
    this.addEventListener("click", this.handleClick);
    this.addEventListener("keydown", this.handleKeydown);
  }

  removeEventListeners() {
    this.removeEventListener("click", this.handleClick);
    this.removeEventListener("keydown", this.handleKeydown);
    if (this._rippleCleanup) {
      this._rippleCleanup();
      this._rippleCleanup = null;
    }
  }

  handleKeydown(event) {
    if (
      (event.key === "Enter" || event.key === " ") &&
      !this.disabled &&
      !this.loading
    ) {
      event.preventDefault();
      this.handleClick(event);
    }
  }

  handleClick(event) {
    if (this.disabled || this.loading) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    // Execute custom onclick handler if provided
    if (this.onclickHandler) {
      try {
        const handler = new Function("event", "button", this.onclickHandler);
        handler.call(this, event, this);
      } catch (error) {
        console.error("Error executing onclick handler:", error);
      }
    }

    // Handle href navigation
    if (this.href && !event.defaultPrevented) {
      event.preventDefault();
      if (this.target === "_blank") {
        window.open(this.href, "_blank", "noopener,noreferrer");
      } else {
        window.location.href = this.href;
      }
    }

    // Dispatch custom event
    this.dispatchEvent(
      new CustomEvent("lume-click", {
        bubbles: true,
        composed: true,
        detail: {
          button: this,
          originalEvent: event,
          href: this.href,
          variant: this.variant,
          size: this.size,
        },
      })
    );
  }

  // Generate inline styles for custom attributes (WITHOUT !important for hover/active)
  generateInlineStyles() {
    const styles = [];

    // Use regular styles without !important to allow hover/active to override
    if (this.color) styles.push(`color: ${this.color}`);
    if (this.bgColor) styles.push(`background: ${this.bgColor}`);
    if (this.border) styles.push(`border: ${this.border} !important`);
    if (this.radius) styles.push(`border-radius: ${this.radius} !important`);
    if (this.padding) styles.push(`padding: ${this.padding} !important`);
    if (this.fontSize) styles.push(`font-size: ${this.fontSize} !important`);
    if (this.fontWeight)
      styles.push(`font-weight: ${this.fontWeight} !important`);
    if (this.width) styles.push(`width: ${this.width} !important`);
    if (this.height) styles.push(`height: ${this.height} !important`);
    if (this.shadow) styles.push(`box-shadow: ${this.shadow} !important`);

    return styles.join("; ");
  }

  // Generate unique class name for this instance
  getInstanceId() {
    if (!this._instanceId) {
      this._instanceId = "lume-btn-" + Math.random().toString(36).substr(2, 9);
    }
    return this._instanceId;
  }

  render() {
    const isLink = !!this.href;
    const isDisabled = this.disabled || this.loading;
    const elementType = isLink ? "a" : "button";
    const inlineStyles = this.generateInlineStyles();
    const instanceId = this.getInstanceId();

    // Generate glow effect for glow variant
    let glowEffect = "";
    if (this.variant === "glow") {
      const glowColor = this.glowColor || "rgba(37, 99, 235, 0.5)";
      glowEffect = `
        .btn.variant-glow {
          box-shadow: 0 0 20px ${glowColor} !important;
        }
        .btn.variant-glow:hover:not(.disabled):not(.loading) {
          box-shadow: 0 0 30px ${glowColor} !important;
        }
      `;
    }

    // Generate custom hover and active styles with proper specificity
    const customHoverActiveStyles = `
      /* Custom hover styles with higher specificity */
      .btn.${instanceId}:hover:not(.disabled):not(.loading) {
        ${this.hoverColor ? `color: ${this.hoverColor} !important;` : ""}
        ${
          this.hoverBgColor
            ? `background: ${this.hoverBgColor} !important;`
            : ""
        }
      }
      
      /* Custom active styles with higher specificity */
      .btn.${instanceId}:active:not(.disabled):not(.loading) {
        ${this.activeColor ? `color: ${this.activeColor} !important;` : ""}
        ${
          this.activeBgColor
            ? `background: ${this.activeBgColor} !important;`
            : ""
        }
      }
    `;

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: ${this.fullWidth ? "block" : "inline-block"};
          --primary-bg: #2563eb;
          --primary-color: #ffffff;
          --primary-hover-bg: #1d4ed8;
          --primary-active-bg: #1e40af;
          
          --secondary-bg: #6b7280;
          --secondary-color: #ffffff;
          --secondary-hover-bg: #4b5563;
          --secondary-active-bg: #374151;
          
          --outlined-bg: transparent;
          --outlined-color: #2563eb;
          --outlined-border: 1px solid #2563eb;
          --outlined-hover-bg: #2563eb;
          --outlined-hover-color: #ffffff;
          
          --ghost-bg: transparent;
          --ghost-color: #374151;
          --ghost-hover-bg: #f3f4f6;
          --ghost-active-bg: #e5e7eb;
          
          --link-bg: transparent;
          --link-color: #2563eb;
          --link-hover-color: #1d4ed8;
        }

        :host([hidden]) {
          display: none !important;
        }

        :host([full-width]) .btn {
          width: 100%;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          position: relative;
          overflow: hidden;
          
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-weight: 500;
          text-decoration: none;
          text-align: center;
          white-space: nowrap;
          user-select: none;
          vertical-align: middle;
          line-height: 1.2;
          
          min-width: 0;
          border: 1px solid transparent;
          border-radius: 0.5rem;
          
          cursor: pointer;
          transition: all 0.15s ease-in-out;
          outline: none;
        }

        /* Size variants */
        .size-small {
          font-size: 0.875rem;
          padding: 0.375rem 0.75rem;
          min-height: 2rem;
        }

        .size-medium {
          font-size: 1rem;
          padding: 0.5rem 1rem;
          min-height: 2.5rem;
        }

        .size-large {
          font-size: 1.125rem;
          padding: 0.75rem 1.5rem;
          min-height: 3rem;
        }

        /* Variant styles */
        .variant-primary {
          background-color: var(--primary-bg);
          color: var(--primary-color);
          border-color: var(--primary-bg);
        }

        .variant-primary:hover:not(.disabled):not(.loading) {
          background-color: var(--primary-hover-bg);
          border-color: var(--primary-hover-bg);
          transform: translateY(-1px);
        }

        .variant-primary:active:not(.disabled):not(.loading) {
          background-color: var(--primary-active-bg);
          border-color: var(--primary-active-bg);
          transform: translateY(0);
        }

        .variant-secondary {
          background-color: var(--secondary-bg);
          color: var(--secondary-color);
          border-color: var(--secondary-bg);
        }

        .variant-secondary:hover:not(.disabled):not(.loading) {
          background-color: var(--secondary-hover-bg);
          border-color: var(--secondary-hover-bg);
          transform: translateY(-1px);
        }

        .variant-secondary:active:not(.disabled):not(.loading) {
          background-color: var(--secondary-active-bg);
          border-color: var(--secondary-active-bg);
          transform: translateY(0);
        }

        .variant-outlined {
          background-color: var(--outlined-bg);
          color: var(--outlined-color);
          border: var(--outlined-border);
        }

        .variant-outlined:hover:not(.disabled):not(.loading) {
          background-color: var(--outlined-hover-bg);
          color: var(--outlined-hover-color);
          transform: translateY(-1px);
        }

        .variant-outlined:active:not(.disabled):not(.loading) {
          background-color: var(--primary-active-bg);
          color: var(--outlined-hover-color);
          transform: translateY(0);
        }

        .variant-ghost {
          background-color: var(--ghost-bg);
          color: var(--ghost-color);
          border-color: transparent;
        }

        .variant-ghost:hover:not(.disabled):not(.loading) {
          background-color: var(--ghost-hover-bg);
          transform: translateY(-1px);
        }

        .variant-ghost:active:not(.disabled):not(.loading) {
          background-color: var(--ghost-active-bg);
          transform: translateY(0);
        }

        .variant-glow {
          background-color: var(--primary-bg);
          color: var(--primary-color);
          border-color: var(--primary-bg);
          box-shadow: 0 0 20px rgba(37, 99, 235, 0.5);
        }

        .variant-glow:hover:not(.disabled):not(.loading) {
          background-color: var(--primary-hover-bg);
          border-color: var(--primary-hover-bg);
          box-shadow: 0 0 30px rgba(37, 99, 235, 0.8);
          transform: translateY(-1px);
        }

        .variant-glow:active:not(.disabled):not(.loading) {
          background-color: var(--primary-active-bg);
          border-color: var(--primary-active-bg);
          transform: translateY(0);
        }

        .variant-link {
          background-color: var(--link-bg);
          color: var(--link-color);
          border: none;
          box-shadow: none;
          padding: 0;
          min-height: auto;
          text-decoration: underline;
        }

        .variant-link:hover:not(.disabled):not(.loading) {
          color: var(--link-hover-color);
          transform: none;
        }

        .variant-link:active:not(.disabled):not(.loading) {
          color: var(--primary-active-bg);
          transform: none;
        }

        .variant-icon-btn {
          padding: 0.5rem;
          aspect-ratio: 1;
          border-radius: 50%;
          background-color: var(--primary-bg);
          color: var(--primary-color);
        }

        .variant-icon-btn.size-small {
          padding: 0.375rem;
        }

        .variant-icon-btn.size-large {
          padding: 0.75rem;
        }

        .variant-icon-btn:hover:not(.disabled):not(.loading) {
          background-color: var(--primary-hover-bg);
          transform: translateY(-1px);
        }

        .variant-icon-btn:active:not(.disabled):not(.loading) {
          background-color: var(--primary-active-bg);
          transform: translateY(0);
        }

        /* Custom glow effect */
        ${glowEffect}

        /* Custom hover and active styles with proper specificity */
        ${customHoverActiveStyles}

        .btn:focus-visible {
          outline: 2px solid currentColor;
          outline-offset: 2px;
        }

        .btn.disabled,
        .btn.loading {
          opacity: 0.6;
          cursor: not-allowed;
          pointer-events: none;
          transform: none !important;
        }

        /* Loading state */
        .loading-spinner {
          width: 1em;
          height: 1em;
          border: 2px solid transparent;
          border-top: 2px solid currentColor;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Ripple effect */
        .ripple {
          position: absolute;
          border-radius: 50%;
          background-color: rgba(255, 255, 255, 0.4);
          transform: scale(0);
          animation: ripple-animation 0.6s ease-out;
          pointer-events: none;
          z-index: 1;
        }

        @keyframes ripple-animation {
          to { 
            transform: scale(4); 
            opacity: 0; 
          }
        }

        /* Slot styles */
        ::slotted(svg),
        ::slotted(i),
        ::slotted(.icon) {
          width: 1em;
          height: 1em;
          flex-shrink: 0;
        }

        .btn-content {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          z-index: 2;
          position: relative;
        }
      </style>

      <${elementType}
        class="btn ${instanceId} variant-${this.variant} size-${this.size} ${
      isDisabled ? "disabled" : ""
    } ${this.loading ? "loading" : ""}"
        ${!isLink ? 'type="button"' : ""}
        ${isLink ? `href="${this.href}"` : ""}
        ${isLink ? `target="${this.target}"` : ""}
        ${isDisabled ? "disabled" : ""}
        ${isLink ? "" : `aria-disabled="${isDisabled}"`}
        tabindex="${isDisabled ? "-1" : "0"}"
        role="${isLink ? "link" : "button"}"
        ${this.loading ? 'aria-busy="true"' : ""}
        ${this.loading ? 'aria-live="polite"' : ""}
        ${inlineStyles ? `style="${inlineStyles}"` : ""}
      >
        <span class="btn-content">
          ${
            this.loading
              ? '<span class="loading-spinner" aria-hidden="true"></span>'
              : ""
          }
          <slot></slot>
        </span>
      </${elementType}>
    `;

    // Setup ripple effect after rendering
    this.setupRippleEffect();
  }

  setupRippleEffect() {
    const btn = this.shadowRoot?.querySelector(".btn");
    if (btn && !this.disabled && !this.loading) {
      // Clean up previous listener
      if (this._rippleCleanup) {
        this._rippleCleanup();
      }

      const rippleHandler = (event) => this.createRipple(event);
      btn.addEventListener("click", rippleHandler);

      this._rippleCleanup = () => {
        btn.removeEventListener("click", rippleHandler);
      };
    }
  }

  createRipple(event) {
    if (this.disabled || this.loading || this.variant === "link") return;

    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    const ripple = document.createElement("span");
    ripple.classList.add("ripple");
    ripple.style.width = ripple.style.height = size + "px";
    ripple.style.left = x + "px";
    ripple.style.top = y + "px";

    button.appendChild(ripple);
    setTimeout(() => {
      if (ripple.parentNode) {
        ripple.remove();
      }
    }, 600);
  }

  // Enhanced public methods
  click() {
    if (!this.disabled && !this.loading) {
      const btn = this.shadowRoot?.querySelector(".btn");
      if (btn) btn.click();
    }
  }

  focus() {
    const btn = this.shadowRoot?.querySelector(".btn");
    if (btn) btn.focus();
  }

  blur() {
    const btn = this.shadowRoot?.querySelector(".btn");
    if (btn) btn.blur();
  }

  setDisabled(disabled) {
    this.disabled = disabled;
  }

  setLoading(loading) {
    this.loading = loading;
  }

  updateStyle(property, value) {
    if (value === null || value === undefined) {
      this.removeAttribute(property);
    } else {
      this.setAttribute(property, value);
    }
  }

  // Validation method
  validate() {
    const issues = [];

    if (this.disabled && this.loading) {
      issues.push("Button cannot be both disabled and loading");
    }

    return issues;
  }
}

// Register the custom element
if (!customElements.get("lume-button")) {
  customElements.define("lume-button", LumeButton);
}
