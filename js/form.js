import { addMessage } from '../src/store/messagesStore.js'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function initForm() {
  const form = document.getElementById('contactForm')
  if (!form) return () => {}

  const submitBtn = form.querySelector('.btn-submit')
  const fields = {
    name: document.getElementById('formName'),
    email: document.getElementById('formEmail'),
    subject: document.getElementById('formSubject'),
    message: document.getElementById('formMessage')
  }

  const validate = () => {
    const errors = {}

    if (!fields.name?.value.trim()) errors.name = 'Please enter your name.'
    if (!fields.email?.value.trim()) errors.email = 'Please enter your email.'
    else if (!EMAIL_RE.test(fields.email.value.trim())) errors.email = 'That email address does not look right.'
    if (!fields.subject?.value.trim()) errors.subject = 'Please add a subject.'
    if (!fields.message?.value.trim()) errors.message = 'Please write a message.'

    return errors
  }

  // Errors render as a small line inside each .form-group, so the markup stays
  // declarative and the stylesheet can own the look.
  const showErrors = (errors) => {
    for (const [key, input] of Object.entries(fields)) {
      const group = input?.closest('.form-group')
      if (!group) continue

      group.querySelector('.field-error')?.remove()
      input.classList.toggle('has-error', Boolean(errors[key]))

      if (!errors[key]) continue

      const note = document.createElement('p')
      note.className = 'field-error'
      note.textContent = errors[key]
      group.appendChild(note)
    }
  }

  const clearErrors = () => showErrors({})

  const onSubmit = (e) => {
    e.preventDefault()
    if (!submitBtn || submitBtn.disabled) return

    const errors = validate()
    if (Object.keys(errors).length > 0) {
      showErrors(errors)
      fields[Object.keys(errors)[0]]?.focus()
      return
    }

    clearErrors()
    submitBtn.classList.add('loading')
    submitBtn.disabled = true

    // Brief pause so the loading state is perceptible, then persist.
    setTimeout(() => {
      try {
        addMessage({
          name: fields.name.value,
          email: fields.email.value,
          subject: fields.subject.value,
          body: fields.message.value
        })

        submitBtn.classList.remove('loading')
        submitBtn.classList.add('success')

        setTimeout(() => {
          submitBtn.classList.remove('success')
          submitBtn.disabled = false
          form.reset()
        }, 3000)
      } catch (err) {
        console.error('[contactForm] could not save message', err)
        submitBtn.classList.remove('loading')
        submitBtn.disabled = false
      }
    }, 400)
  }

  // Clear a field's error as soon as the visitor starts fixing it.
  const onInput = () => {
    if (!submitBtn?.disabled) clearErrors()
  }
  for (const input of Object.values(fields)) {
    input?.addEventListener('input', onInput)
  }

  form.addEventListener('submit', onSubmit)

  return () => {
    form.removeEventListener('submit', onSubmit)
    for (const input of Object.values(fields)) {
      input?.removeEventListener('input', onInput)
    }
  }
}