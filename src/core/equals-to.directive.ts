import {
  Directive,
  forwardRef,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  OnDestroy,
  ViewContainerRef
} from "@angular/core";
import {
  NgModel,
  NG_VALIDATORS,
  Validator,
  AbstractControl,
  FormControl
} from "@angular/forms";
import { Subscription } from "rxjs/Subscription";
import { Utils } from "./utils";

@Directive({
  selector:
    "[validateEqual][formControlName],[validateEqual][formControl],[validateEqual][ngModel]",
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => EqualsToDirective),
      multi: true
    }
  ]
})
export class EqualsToDirective implements Validator, OnDestroy {
  @Input() validateEqual: string;
  @Output() ngModelChange: EventEmitter<any> = new EventEmitter();
  subling: Element;
  hasListener = false;
  value: string;

  constructor(private el: ElementRef) {}
  validate(c: AbstractControl): { [key: string]: any } {
    //keep last value
    this.value = c.value;
    //get sibling
    this.subling =
      this.subling ||
      Utils.getElement(this.validateEqual, this.el.nativeElement);
    if (this.subling instanceof HTMLInputElement) {
      //listen to sibling's input event
      if (!this.hasListener) {
        this.subling.addEventListener("input", this.eventListener);
        this.hasListener = true;
      }
      // value not equal
      if (this.value && this.value !== this.subling.value)
        return {
          validateEqual: false
        };
    }
    return null;
  }
  ngOnDestroy(): void {
    this.subling.removeEventListener("input", this.eventListener);
  }

  //update if sibling updates
  eventListener = e => {
    if (this.value) {
      this.el.nativeElement.dispatchEvent(new Event("input"), "");
    }
  };

  // getElement(name: string): Element {
  //   let htmlElement: HTMLElement = this.el.nativeElement;
  //   while (["FORM", "BODY"].indexOf(htmlElement.tagName) == -1) {
  //     htmlElement = htmlElement.parentElement;
  //   }
  //   return htmlElement.querySelector(`input[name='${name}']`);
  // }
}
