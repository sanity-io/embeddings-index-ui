import {NamedIndex} from '../api/embeddingsApi'
import {Dispatch, FormEvent, SetStateAction, useCallback, useId} from 'react'
import {Label, Stack, TextArea, TextInput} from '@sanity/ui'

export interface IndexFormInputProps {
  index: Partial<NamedIndex>
  prop: keyof NamedIndex
  label: string
  onChange: Dispatch<SetStateAction<Partial<NamedIndex>>>
  readOnly: boolean
  placeholder?: string
  type?: 'text' | 'textarea'
}

export function IndexFormInput(props: IndexFormInputProps) {
  const {label, index, prop, onChange, readOnly, placeholder, type} = props
  const handleChange = useCallback(
    (propValue: string) => onChange((current) => ({...current, [prop]: propValue})),
    [onChange, prop],
  )
  return (
    <FormInput
      label={label}
      onChange={handleChange}
      value={index[prop] ?? ''}
      readOnly={readOnly}
      placeholder={placeholder}
      type={type}
    />
  )
}

interface FormInputProps {
  label: string
  onChange: (value: string) => void
  value: string
  readOnly: boolean
  placeholder?: string
  type?: 'text' | 'textarea'
}

function FormInput(props: FormInputProps) {
  const {label, onChange, value, readOnly, placeholder, type = 'text'} = props
  const id = useId()
  const handleChange = useCallback(
    (e: FormEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(e.currentTarget.value),
    [onChange],
  )
  return (
    <Stack space={3}>
      <Label muted htmlFor={id}>
        <label htmlFor={id}>{label}</label>
      </Label>
      {type === 'text' ? (
        <TextInput
          id={id}
          value={value}
          onChange={handleChange}
          readOnly={readOnly}
          placeholder={placeholder}
        />
      ) : (
        <TextArea
          id={id}
          value={value}
          rows={3}
          onChange={handleChange}
          readOnly={readOnly}
          placeholder={placeholder}
          style={{resize: 'vertical'}}
        />
      )}
    </Stack>
  )
}
