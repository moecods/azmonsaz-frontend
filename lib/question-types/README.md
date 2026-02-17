# Question Types (Single Source)

این ماژول منبع واحد برای انواع سوال در فرانت‌اند است و با استراتژی‌های بک‌اند (Laravel `QuestionTypeStrategyFactory`) هم‌تراز است.

## نوع‌های سوال (۸ نوع)

| شناسه | برچسب فارسی | kind |
|--------|--------------|------|
| `multiple_choice` | چند گزینه‌ای | options_single |
| `true_false` | صحیح/غلط | options_fixed |
| `multiple_select` | چند گزینه‌ای (چند پاسخ) | options_multiple |
| `essay` | تشریحی | text |
| `short_answer` | پاسخ کوتاه | text |
| `fill_in_the_blank` | جای خالی | blanks |
| `matching` | تطبیقی | matching |
| `ordering` | ترتیب‌دهی | ordering |

## معنی `kind`ها

- **options_single**: یک گزینه صحیح از لیست گزینه‌ها (رادیو).
- **options_multiple**: چند گزینه صحیح (چک‌باکس).
- **options_fixed**: گزینه‌های ثابت (مثلاً صحیح/غلط)، بدون افزودن/حذف گزینه.
- **text**: پاسخ متنی؛ `essay` برای پاراگراف، `short_answer` برای یک خط.
- **ordering**: لیست موارد و ترتیب صحیح آن‌ها.
- **matching**: دو ستون چپ/راست و تطبیق هر مورد چپ با یک مورد راست.
- **blanks**: چند جای خالی با پاسخ صحیح هر کدام.

## استفاده

- **ثابت‌ها و نوع**: از `constants.ts` استفاده کنید: `QUESTION_TYPE_IDS`, `QuestionTypeId`, `isQuestionTypeId`.
- **متادیتا و کمکی‌ها**: از `registry.ts` یا `@/lib/question-types`: `getQuestionTypeConfig(type)`, `getQuestionTypeLabel(type)`, `getQuestionTypeKind(type)`, `isOptionsBased(type)`, `isEssay(type)` و مشابه.
- **ساخت payload**: از `getDescriptor(type)` در `descriptors` استفاده کنید: `buildExamPayload(data, categories)`, `buildBankPayload(data)`.

## اضافه کردن نوع جدید

1. **ثابت‌ها**: در `constants.ts` شناسهٔ جدید را به آرایهٔ `QUESTION_TYPE_IDS` اضافه کنید.
2. **رجیستری**: در `registry.ts` یک ردیف به `REGISTRY` با `id`, `labelFa`, `kind` مناسب اضافه کنید.
3. **دسکریپتور**: در `lib/question-types/descriptors/` یک فایل جدید (مثلاً `myType.ts`) با `buildExamPayload` و در صورت نیاز `buildBankPayload` بسازید و در `descriptors/index.ts` به `DESCRIPTORS` وصل کنید.
4. **اعتبارسنجی**: در `lib/validation.ts` اگر قانون نوع‌خاص جدید لازم است، در `superRefine` بر اساس `getQuestionTypeKind(type)` شرط مناسب را اضافه کنید (ترجیحاً با استفاده از `kind` تا افزودن نوع جدید فقط با رجیستری و دسکریپتور ممکن شود).
5. **فرم و پیش‌نمایش**: در `CreateQuestionContent.tsx` در `renderTypeSpecificForm` و در `QuestionPreview` (useMemo) بلوک شرطی برای نوع جدید اضافه کنید؛ یا در آینده با FormSection/PreviewSection از دسکریپتور یکپارچه شود.
6. **صفحات آزمون و نتیجه**: اگر نوع جدید نیاز به ویجت پاسخ دارد، در `QuestionAnswerInput` و `QuestionResultDisplay` بر اساس `getQuestionTypeKind(type)` یا `type` شاخهٔ رندر مناسب را اضافه کنید.

بک‌اند نیازی به تغییر ندارد؛ نام نوع‌ها باید با Strategyهای Laravel یکسان باشند.
