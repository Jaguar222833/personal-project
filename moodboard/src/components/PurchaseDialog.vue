<script setup>
// [ДОДАТКОВО] Оформлення покупки пресетів з перевіркою полів.
// Перевірку роблять бібліотеки: vee-validate (стан форми, помилки) + zod (правила полів).
// Вікно — нативний <dialog>: фокус усередині, Esc закриває, фон затемнюється сам.
import { useTemplateRef, watch } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import { X } from '@lucide/vue'
import { toast } from 'vue-sonner'
import { formatPrice, plural } from '@/utils/format'

const props = defineProps({
  open: { type: Boolean, default: false },
  count: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
})
const emit = defineEmits(['close', 'done'])

// правила полів — одним описом; повідомлення українською
const schema = toTypedSchema(
  z.object({
    name: z.string().trim().min(2, 'Вкажіть ім\'я — щонайменше 2 літери'),
    email: z.string().trim().email('Схоже, в адресі помилка: має бути name@example.com'),
    format: z.enum(['classic', 'mobile'], { message: 'Оберіть версію Lightroom' }),
    agree: z.literal(true, { errorMap: () => ({ message: 'Потрібна згода з умовами' }) }),
  }),
)

const { defineField, errors, handleSubmit, resetForm, isSubmitting } = useForm({
  validationSchema: schema,
  initialValues: { name: '', email: '', format: 'classic', agree: false },
})

// defineField повертає значення поля і атрибути (blur/input) для v-model і v-bind
const [name, nameAttrs] = defineField('name')
const [email, emailAttrs] = defineField('email')
const [format, formatAttrs] = defineField('format')
const [agree, agreeAttrs] = defineField('agree')

const dialog = useTemplateRef('dialog')

// prop open керує вікном: true — showModal(), false — close()
watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) dialog.value?.showModal()
    else dialog.value?.close()
  },
)

const submit = handleSubmit(async (values) => {
  await new Promise((resolve) => setTimeout(resolve, 600))   // імітація відправки
  toast.success(`Дякую, ${values.name}! Це демо: оплата не проводиться, але посилання прийшло б на ${values.email}.`)
  resetForm()
  emit('done')
})
</script>

<template>
  <dialog ref="dialog" class="dialog" aria-labelledby="buy-title" @close="emit('close')">
    <form class="form" novalidate @submit.prevent="submit">
      <div class="form__head">
        <h2 id="buy-title">Пресети Lightroom</h2>
        <button type="button" class="icon-btn" aria-label="Закрити" @click="emit('close')">
          <X aria-hidden="true" />
        </button>
      </div>
      <p class="muted">
        {{ plural(count, { one: 'пресет', few: 'пресети', many: 'пресетів' }) }} · до сплати
        <strong>{{ formatPrice(total) }}</strong>
      </p>

      <label class="field">
        <span class="field__label">Ім'я</span>
        <input
          v-model="name"
          v-bind="nameAttrs"
          class="input"
          :class="{ 'input--error': errors.name }"
          autocomplete="name"
          :aria-invalid="!!errors.name"
          aria-describedby="err-name"
        >
        <span id="err-name" class="field__error">{{ errors.name }}</span>
      </label>

      <label class="field">
        <span class="field__label">Email для посилання</span>
        <input
          v-model="email"
          v-bind="emailAttrs"
          class="input"
          :class="{ 'input--error': errors.email }"
          type="email"
          autocomplete="email"
          :aria-invalid="!!errors.email"
          aria-describedby="err-email"
        >
        <span id="err-email" class="field__error">{{ errors.email }}</span>
      </label>

      <fieldset class="field">
        <legend class="field__label">Версія Lightroom</legend>
        <div class="choices">
          <label class="choice">
            <input v-model="format" v-bind="formatAttrs" type="radio" value="classic"> Classic (.xmp)
          </label>
          <label class="choice">
            <input v-model="format" v-bind="formatAttrs" type="radio" value="mobile"> Mobile (.dng)
          </label>
        </div>
        <span class="field__error">{{ errors.format }}</span>
      </fieldset>

      <label class="check">
        <input v-model="agree" v-bind="agreeAttrs" type="checkbox" aria-describedby="err-agree">
        Погоджуюсь, що пресети — для особистого використання
      </label>
      <span id="err-agree" class="field__error">{{ errors.agree }}</span>

      <button type="submit" class="btn btn--primary" :disabled="isSubmitting">
        {{ isSubmitting ? 'Надсилаю…' : `Сплатити ${formatPrice(total)}` }}
      </button>
      <p class="muted form__note">Демонстрація: справжня оплата не відбувається.</p>
    </form>
  </dialog>
</template>

<style scoped>
.dialog {
  width: min(100% - 2rem, 28rem);
  max-height: calc(100dvh - 2rem);
  padding: 0;
  border: 1px solid var(--border);
  border-radius: calc(var(--radius) * 1.5);
  background: var(--surface);
  color: var(--text);
  box-shadow: var(--shadow);

  &::backdrop {
    background: rgb(0 0 0 / .6);
    backdrop-filter: blur(4px);
  }

  &[open] { animation: pop-in .45s var(--spring); }
}

@keyframes pop-in {
  from { opacity: 0; transform: scale(.94); }
}

.form {
  display: grid;
  gap: .6rem;
  padding: 1.25rem;
}

.form__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;

  & h2 { margin: 0; }
}

.field {
  display: grid;
  gap: .25rem;
  margin: 0;
  padding: 0;
  border: 0;
}

.field__label {
  padding: 0;
  font-size: .875rem;
  font-weight: 600;
}

.field__error {
  min-height: 1.1em;
  color: var(--danger);
  font-size: .8rem;
}

.input--error { border-color: var(--danger); }

.choices {
  display: flex;
  flex-wrap: wrap;
  gap: .5rem 1.25rem;
}

.choice,
.check {
  display: flex;
  align-items: center;
  gap: .5rem;
  min-height: 2.75rem;
  cursor: pointer;

  & input {
    width: 1.2rem;
    height: 1.2rem;
    accent-color: var(--accent);
  }
}

.check { font-size: .9rem; }

.form__note {
  margin: 0;
  font-size: .8rem;
  text-align: center;
}
</style>
