import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'

import { useForm } from '../index.js'

const FormExample = ({ validations }) => {
  const { register } = useForm()
  const { props, isTouched, errors } = register('test', {
    validations
  })

  return (
    <form>
      <h1>Testing</h1>
      <input type='text' {...props} />
      {isTouched && errors && <span>input has errors</span>}
    </form>
  )
}

const FormExample2 = ({ validations }) => {
  const { register } = useForm()
  const { props, isTouched, errors } = register('test', {
    validations
  })

  return (
    <form>
      <h1>Testing</h1>
      <input type='text' {...props} />
      {isTouched && errors.required && <span>input has required errors</span>}
      {isTouched && errors.minLength && <span>input has minLength errors</span>}
      {isTouched && errors.maxLength && <span>input has maxLength errors</span>}
      {isTouched && errors.min && <span>input has min errors</span>}
      {isTouched && errors.max && <span>input has max errors</span>}
      {isTouched && errors.regex && <span>input has regex errors</span>}
      {isTouched && errors.anything && <span>input has anything errors</span>}
    </form>
  )
}

describe('Input validations', () => {
  const setup1 = () => {
    const validations = {
      required: true
    }
    return render(<FormExample validations={validations} />)
  }

  const setup2 = () => {
    const validations = {
      required: true,
      minLength: 3
    }
    return render(<FormExample2 validations={validations} />)
  }

  const setupMinL = () => {
    const validations = { minLength: 3 }
    return render(<FormExample2 validations={validations} />)
  }

  const setupMaxL = () => {
    const validations = { maxLength: 5 }
    return render(<FormExample2 validations={validations} />)
  }

  const setupMin = () => {
    const validations = { min: 5.1 }
    return render(<FormExample2 validations={validations} />)
  }

  const setupMax = () => {
    const validations = { max: 10 }
    return render(<FormExample2 validations={validations} />)
  }

  const setupRegex = () => {
    const validations = { regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ }
    return render(<FormExample2 validations={validations} />)
  }

  const setupFncVal = () => {
    const validations = { anything: (val) => val === 'ok' }
    return render(<FormExample2 validations={validations} />)
  }

  it('must show error when validation fails', async () => {
    setup1()

    const input = screen.getByRole('textbox')
    await userEvent.click(input)
    await userEvent.click(screen.queryByText('Testing')) // to blur
    // fireEvent.focus(input)
    // fireEvent.blur(input)
    const span = screen.getByText('input has errors')

    expect(span).toBeInTheDocument()
  })

  it('must not show error when validation is ok', async () => {
    setup1()

    const input = screen.getByRole('textbox')
    await userEvent.type(input, 'holi')
    await userEvent.click(screen.queryByText('Testing')) // to blur
    const span = screen.queryByText('input has errors')

    expect(span).not.toBeInTheDocument()
  })

  it('must show the correct error when one validation fails', async () => {
    setup2()

    const input = screen.getByRole('textbox')
    await userEvent.type(input, 'ab')
    await userEvent.click(screen.queryByText('Testing')) // to blur
    const span1 = screen.queryByText('input has required errors')
    const span2 = screen.queryByText('input has minLength errors')

    expect(span1).not.toBeInTheDocument()
    expect(span2).toBeInTheDocument()
  })

  // Test validators
  // Test validators
  // Test validators
  it('must not show error message when required and have a value', async () => {
    setup1()

    const input = screen.getByRole('textbox')
    await userEvent.type(input, 'a')
    await userEvent.click(screen.getByText('Testing'))
    const span = screen.queryByText('input has errors')

    expect(span).not.toBeInTheDocument()
  })

  it('must hide an error when min length validation passes', async () => {
    setupMinL()

    const input = screen.getByRole('textbox')
    await userEvent.type(input, 'a')
    await userEvent.click(screen.getByText('Testing')) // To blur
    const span = screen.queryByText('input has minLength errors')
    expect(span).toBeInTheDocument()

    await userEvent.type(input, 'abc')
    await userEvent.click(screen.getByText('Testing')) // To blur

    expect(
      screen.queryByText('input has minLength errors')
    ).not.toBeInTheDocument()
  })

  it('must show an error when max length validation not passes', async () => {
    setupMaxL()

    const input = screen.getByRole('textbox')
    await userEvent.type(input, 'a')
    await userEvent.click(screen.getByText('Testing')) // To blur
    const span = screen.queryByText('input has maxLength errors')
    expect(span).not.toBeInTheDocument()

    await userEvent.type(input, 'abcde')
    await userEvent.click(screen.getByText('Testing')) // To blur

    expect(screen.getByText('input has maxLength errors')).toBeInTheDocument()
  })

  it('must hide an error when min validation passes', async () => {
    // const user = userEvent.setup()
    setupMin()

    const input = screen.getByRole('textbox')
    await userEvent.type(input, '5')
    await userEvent.click(screen.queryByText('Testing')) // to blur
    const span = screen.queryByText('input has min errors')
    expect(span).toBeInTheDocument()

    await userEvent.clear(input)
    await userEvent.type(input, '7')
    await userEvent.click(screen.queryByText('Testing')) // to blur
    // fireEvent.blur(input)
    // screen.debug()
    expect(screen.queryByText('input has min errors')).not.toBeInTheDocument()
  })

  it('must hide an error when max validation passes', async () => {
    setupMax()

    const input = screen.getByRole('textbox')
    await userEvent.type(input, '10.1')
    await userEvent.click(screen.queryByText('Testing')) // to blur
    const span = screen.queryByText('input has max errors')
    expect(span).toBeInTheDocument()

    await userEvent.clear(input)
    await userEvent.type(input, '9.99')
    await userEvent.click(screen.queryByText('Testing')) // to blur

    expect(screen.queryByText('input has max errors')).not.toBeInTheDocument()
  })

  it('must hide the error when regex validation passes', async () => {
    setupRegex()

    const input = screen.getByRole('textbox')
    await userEvent.type(input, 'not an email')
    await userEvent.click(screen.queryByText('Testing')) // to blur
    const span = screen.queryByText('input has regex errors')
    expect(span).toBeInTheDocument()

    await userEvent.clear(input)
    await userEvent.type(input, 'test@test.com')
    await userEvent.click(screen.queryByText('Testing')) // to blur

    expect(screen.queryByText('input has regex errors')).not.toBeInTheDocument()
  })

  it('must show error when validating with a custom function', async () => {
    setupFncVal()

    const input = screen.getByRole('textbox')
    await userEvent.type(input, 'the validator expects to find an "ok" here')
    await userEvent.click(screen.queryByText('Testing')) // to blur
    const span = screen.getByText('input has anything errors')
    expect(span).toBeInTheDocument()

    await userEvent.clear(input)
    await userEvent.type(input, 'ok')
    await userEvent.click(screen.queryByText('Testing')) // to blur

    expect(
      screen.queryByText('input has anything errors')
    ).not.toBeInTheDocument()
  })
})
