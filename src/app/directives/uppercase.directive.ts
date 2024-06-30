import { Directive, ElementRef, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appUppercase]',
  standalone: true
})
export class UppercaseDirective {
  constructor(private el: ElementRef, private control: NgControl) { }

  @HostListener('input', ['$event']) onInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const uppercasedValue = input.value.toUpperCase();
    this.el.nativeElement.value = uppercasedValue;
    this.control.control?.setValue(uppercasedValue, { emitEvent: false });
  }

  @HostListener('blur') onBlur() {
    const value = this.el.nativeElement.value;
    const uppercasedValue = value.toUpperCase();
    this.el.nativeElement.value = uppercasedValue;
    this.control.control?.setValue(uppercasedValue);
  }

}
