'use client'

import type { ChangeEvent, MouseEvent, ReactNode } from 'react'
import { useFormStatus } from 'react-dom'

export function SubmitButton({
  children,
  pendingText = 'Сохранение...',
  className = '',
}: {
  children: ReactNode
  pendingText?: string
  className?: string
}) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className={`${className} disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {pending ? pendingText : children}
    </button>
  )
}

export function ConfirmButton({
  message,
  children,
  pendingText = 'Выполняется...',
  className = '',
}: {
  message: string
  children: ReactNode
  pendingText?: string
  className?: string
}) {
  const { pending } = useFormStatus()

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (!window.confirm(message)) {
      e.preventDefault()
    }
  }

  return (
    <button
      type="submit"
      disabled={pending}
      onClick={handleClick}
      className={`${className} disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {pending ? pendingText : children}
    </button>
  )
}

export function BulkSubmitButton({ className = '' }: { className?: string }) {
  const { pending } = useFormStatus()

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    const form = e.currentTarget.form
    const op = form?.querySelector<HTMLSelectElement>('select[name="op"]')?.value
    const checkedCount = document.querySelectorAll<HTMLInputElement>(
      'input[name="ids"][form="bulk-form"]:checked'
    ).length

    if (checkedCount === 0) {
      e.preventDefault()
      window.alert('Выберите хотя бы один товар')
      return
    }

    if (
      op === 'delete' &&
      !window.confirm(`Удалить выбранные товары (${checkedCount} шт.) и все их фото?`)
    ) {
      e.preventDefault()
    }
  }

  return (
    <button
      type="submit"
      disabled={pending}
      onClick={handleClick}
      className={`${className} disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {pending ? 'Применение...' : 'Применить'}
    </button>
  )
}

export function SelectAllCheckbox({ className = '' }: { className?: string }) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked
    const boxes = document.querySelectorAll<HTMLInputElement>(
      'input[name="ids"][form="bulk-form"]'
    )
    boxes.forEach((box) => {
      box.checked = checked
    })
  }

  return (
    <input
      type="checkbox"
      onChange={handleChange}
      aria-label="Выбрать все товары"
      className={className}
    />
  )
}