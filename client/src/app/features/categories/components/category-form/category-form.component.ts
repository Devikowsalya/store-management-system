import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  output,
  signal
} from '@angular/core';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  Category,
  CategoryFormValue
} from '../../models/category.model';


export type CategoryFormMode =
  'create' | 'edit';


@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './category-form.component.html',
  styleUrl: './category-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CategoryFormComponent {

  private readonly fb =
    inject(FormBuilder);


  /*
   * Inputs
   */

  readonly mode =
    input<CategoryFormMode>('create');

  readonly category =
    input<Category | null>(null);


  /*
   * Outputs
   */

  readonly saved =
    output<CategoryFormValue>();

  readonly cancelled =
    output<void>();


  /*
   * UI State
   */

  readonly isSaving =
    signal(false);


  /*
   * Form
   */

  readonly form =
    this.fb.nonNullable.group({

      categoryName: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100)
        ]
      ],

      isActive: [
        true
      ]

    });


  constructor() {

    /*
     * Whenever selected category changes,
     * populate the form automatically.
     */

    effect(() => {

      const category =
        this.category();

      const mode =
        this.mode();


      if (
        mode === 'edit' &&
        category
      ) {

        this.form.reset({
          categoryName:
            category.categoryName,

          isActive:
            category.isActive
        });

        return;
      }


      /*
       * Create mode
       */

      this.form.reset({
        categoryName: '',
        isActive: true
      });

    });

  }


  /*
   * Submit
   */

  submit(): void {

    if (this.form.invalid) {

      this.form.markAllAsTouched();

      return;
    }

    this.saved.emit(
      this.form.getRawValue()
    );
  }


  /*
   * Cancel
   */

  cancel(): void {
    this.cancelled.emit();
  }


  get categoryName() {
    return this.form.controls.categoryName;
  }
}