import React from 'react';
import { render, screen, act } from '@testing-library/react';
import user from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import * as Joi from 'joi';
import { joiResolver } from '..';

const schema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

interface FormData {
  username: string;
  password: string;
}

interface Props {
  onSubmit: (data: FormData) => void;
}

function TestComponent({ onSubmit }: Props) {
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<FormData>({
    resolver: joiResolver(schema), // Useful to check TypeScript regressions
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('username')} />
      {errors.username && <span role="alert">{errors.username.message}</span>}

      <input {...register('password')} />
      {errors.password && <span role="alert">{errors.password.message}</span>}

      <button type="submit">submit</button>
    </form>
  );
}

test("form's validation with Joi and TypeScript's integration", async () => {
  const handleSubmit = jest.fn();
  render(<TestComponent onSubmit={handleSubmit} />);

  expect(screen.queryAllByRole(/alert/i)).toHaveLength(0);

  await act(async () => {
    user.click(screen.getByText(/submit/i));
  });

  expect(
    screen.getByText(/"username" is not allowed to be empty/i),
  ).toBeInTheDocument();
  expect(
    screen.getByText(/"password" is not allowed to be empty/i),
  ).toBeInTheDocument();
  expect(handleSubmit).not.toHaveBeenCalled();
});
