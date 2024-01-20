// React
import { useState, useEffect, useLayoutEffect, useCallback } from "react";
// React Router
import { useLocation, useNavigate } from "react-router-dom";
// Styled Component
import styled, { css, useTheme } from "styled-components";
// Services
import axios from "../services/axios";
// React Hook Form & Validators
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { object, string } from "yup";
// Styles
import { Text, Error } from "../styles/Text";
import { HoverCSS } from "../styles/Interactions";
import { Flex } from "../styles/Containers";
import { CalligraffittiCSS } from "../styles/Font";
import { InputCSS } from "../styles/Input";
import { Anchor } from "../styles/Anchor";
// Components
import { Spinner } from "../components/Loader";
// Context
import { useStore, useDispatch } from "../providers/context";
// Constants, Helpers & Types
import { ActionType } from "../utils/types/enum";
import {
  AuthCredentials,
  AuthRoute,
  InputElement,
  UserType,
} from "../utils/types";
import { axiosErrorMessage, updateStyle } from "../utils/helpers";
import { SEO } from "../utils/constants";

const maxLength = 256;

const characterLimitMessage = (key: string, length: number) =>
  `${key} must be at least ${length} characters.`;

// register schema for form
const registerSchema = object({
  email: string().email("Email is not valid.").required("Email is not valid."),
  username: string()
    .min(3, characterLimitMessage("Username", 3))
    .required(characterLimitMessage("Username", 3)),
  password: string()
    .min(6, characterLimitMessage("Password", 6))
    .required(characterLimitMessage("Password", 6)),
  bio: string().max(maxLength, `Bio cannot exceed ${maxLength} characters.`),
});

// login schema for form
const loginSchema = object({
  identity: string().required("Username or Email is not valid."),
  password: string().required("Password is not valid."),
});

const Container = styled(Flex)`
  flex-direction: column;
  text-align: center;
  top: 10vh;
  max-width: 375px;
  width: calc(100vw - 1em);
  margin: auto;
`;

const Calligraphy = styled(Text)`
  ${CalligraffittiCSS}
  white-space: nowrap;
`;

const Status = styled(Text)`
  opacity: ${({ theme }) => theme.opacity.dim};
  position: absolute;
  right: 1em;
  height: 100%;
  display: flex;
  align-items: center;
  cursor: pointer;
`;

const TextInput = styled.input<{ sub?: boolean; capitalize?: boolean }>`
  ${InputCSS};
  text-transform: ${({ capitalize }) => capitalize && "capitalize"};
  ${({ sub }) =>
    sub &&
    css`
      border-top-width: 1.5em;
      border-bottom-width: 0.5em;
    `}
`;

const BioInput = styled.textarea`
  ${InputCSS};
  resize: none;
  height: auto;
`;

const Submit = styled.input`
  ${InputCSS};
  ${HoverCSS};
  background: unset;
  border-radius: unset;
`;

const PlaceHolder = styled(Text)<{ sub?: boolean }>`
  position: absolute;
  pointer-events: none;
  left: 1em;
  margin-top: 1em;
  transition: all 0.1s;
  opacity: ${({ theme }) => theme.opacity.dim};
  ${({ sub }) =>
    sub &&
    css`
      left: 1.125em;
      margin-top: 0.5em;
      font-size: smaller;
    `}
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  height: 100%;
  width: 100%;

  // all form first children except last child
  & > div:not(:last-child) {
    margin-bottom: 1em;
  }
`;

// update autofill color styles helper
const setAutoFillColor = (currentTarget: InputElement) => {
  const placeHolder = currentTarget.previousSibling as HTMLSpanElement;

  const color = window
    .getComputedStyle(currentTarget)
    .getPropertyValue("color");

  updateStyle(placeHolder, {
    color,
  });

  if (placeHolder.textContent === "Password") {
    updateStyle(currentTarget.nextSibling, {
      color,
    });
  }
};

const onChange: React.FormEventHandler<InputElement> = ({ currentTarget }) => {
  if (currentTarget.value) {
    onFocus({ currentTarget } as React.FocusEvent<InputElement>);
  } else {
    onBlur({ currentTarget } as React.FocusEvent<InputElement>);
  }
};

const onFocus: React.FocusEventHandler<InputElement> = ({ currentTarget }) => {
  setAutoFillColor(currentTarget);

  const placeHolder = currentTarget.previousSibling;

  updateStyle(placeHolder, {
    left: "1.125em",
    marginTop: "0.5em",
    fontSize: "smaller",
  });

  updateStyle(currentTarget, {
    borderTopWidth: "1.5em",
    borderBottomWidth: "0.5em",
  });
};

const onBlur: React.FocusEventHandler<InputElement> = ({ currentTarget }) => {
  setAutoFillColor(currentTarget);

  if (currentTarget.value) {
    return;
  }

  const placeHolder = currentTarget.previousSibling as HTMLSpanElement;

  updateStyle(placeHolder, {
    left: "1.125em",
    marginTop: "1em",
    fontSize: "",
  });

  updateStyle(currentTarget, {
    borderTopWidth: "",
    borderBottomWidth: "",
  });
};

const Authenticate = ({ route }: { route: AuthRoute }) => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { authenticating, user } = useStore();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const registering = route === "Sign Up";
  const {
    register,
    handleSubmit,
    clearErrors,
    resetField,
    formState: { errors },
  } = useForm<AuthCredentials>({
    resolver: yupResolver(registering ? registerSchema : loginSchema),
  });

  // form submit handler
  const onSubmit: SubmitHandler<AuthCredentials> = useCallback(
    async (input) => {
      dispatch(ActionType.AUTHENTICATING);

      // Clear previous errors
      setError("");

      try {
        const { identity, username, email, bio, password } = input;

        // Determine the API endpoint based on the form type (registering or login)
        const endpoint = registering ? "/user/register" : "/user/login";
        const requestData = registering
          ? { username, email, bio, password }
          : { identity, password };

        const { data } = await axios.post<Body & { user: UserType }>(
          endpoint,
          requestData
        );
        dispatch(ActionType.AUTHENTICATED, data.user);
      } catch (error) {
        const message = axiosErrorMessage(error);
        setError(message);
        dispatch(ActionType.AUTHENTICATED, undefined);
      }
    },
    [dispatch, setError, registering]
  );

  useLayoutEffect(() => {
    if (!user) {
      return;
    }
    /* 
        Redirect them to the home page, but save the current location they were
        trying to go to when they were redirected. This allows us to send them
        along to that page after they login, which is a nicer user experience
        than dropping them off on the home page.
      */

    // replace login or register route with home page if user is authenticated
    navigate("/", {
      replace: true,
      state: { from: location },
    });
  }, [user]);

  useEffect(() => {
    // clear form errors
    clearErrors();

    const fields = registering ? registerSchema.fields : loginSchema.fields;

    for (const field in fields) {
      // reset form inputs to default values
      resetField(field as keyof AuthCredentials);
    }

    // finished loading UI
    setLoading(false);
  }, [route]);

  return (
    <Container>
      <Flex
        border
        direction="column"
        padding="1em"
        justify="space-between"
        height="100%"
        align="center"
        index={1}
      >
        <Anchor to={"/"}>
          <Calligraphy font="x-large" bold>
            {SEO.title}
          </Calligraphy>
        </Anchor>
        <Text dim bold padding="0.5em 0" margin={theme.spacing.bottom("1em")}>
          {`${route} to see posts from your friends.`}
        </Text>

        {loading ? (
          <Spinner />
        ) : (
          <Form noValidate onSubmit={handleSubmit(onSubmit)}>
            {registering && (
              <>
                <Flex direction="column" align="flex-start">
                  <PlaceHolder>Email</PlaceHolder>
                  <TextInput
                    onFocus={onFocus}
                    aria-label="Email address"
                    autoCapitalize="off"
                    aria-required="true"
                    autoCorrect="off"
                    autoComplete="email"
                    type="email"
                    {...register("email", { onBlur, onChange })}
                  />
                  {errors.email?.message && (
                    <Error padding="0.5em 0">{errors.email.message}</Error>
                  )}
                </Flex>
              </>
            )}

            <Flex direction="column" align="flex-start">
              <PlaceHolder>
                {registering ? "Username" : "Username or Email"}
              </PlaceHolder>
              <TextInput
                onFocus={onFocus}
                aria-label="Username"
                autoCapitalize="off"
                aria-required="true"
                autoCorrect="off"
                type="text"
                {...register(registering ? "username" : "identity", {
                  onBlur,
                  onChange,
                })}
              />
              {/* For Register */}
              {errors.username?.message && (
                <Error padding="0.5em 0">{errors.username.message}</Error>
              )}
              {/* For Login */}
              {errors.identity?.message && (
                <Error padding="0.5em 0">{errors.identity.message}</Error>
              )}
            </Flex>

            <Flex direction="column">
              <Flex direction="column" align="flex-start">
                <PlaceHolder>Password</PlaceHolder>
                <TextInput
                  onFocus={onFocus}
                  aria-label="Password"
                  aria-required="true"
                  autoCapitalize="off"
                  autoComplete="new-password"
                  autoCorrect="off"
                  type="password"
                  {...register("password", {
                    onBlur,
                    onChange,
                  })}
                />
                <Status
                  // show password handler
                  onClick={({ currentTarget }) => {
                    const show = currentTarget.textContent === "Show";
                    currentTarget.textContent = show ? "Hide" : "Show";
                    currentTarget.previousElementSibling?.setAttribute(
                      "type",
                      show ? "text" : "password"
                    );
                  }}
                >
                  Show
                </Status>
              </Flex>
              {errors.password?.message && (
                <Error padding="0.5em 0">{errors.password.message}</Error>
              )}
            </Flex>

            {registering && (
              <>
                {/* Bio */}
                <Flex direction="column" align="flex-start">
                  <PlaceHolder>Bio</PlaceHolder>
                  <BioInput
                    rows={3}
                    maxLength={maxLength}
                    onFocus={onFocus}
                    {...register("bio", { onBlur, onChange })}
                  />

                  {errors.bio?.message && (
                    <Error padding="0.5em 0">{errors.bio.message}</Error>
                  )}
                </Flex>
              </>
            )}
            <Flex
              border
              overflow="hidden"
              align="center"
              justify="center"
              padding={authenticating ? "1em 0" : undefined}
            >
              {authenticating ? (
                <Spinner />
              ) : (
                <Submit type="submit" value={route} />
              )}
            </Flex>

            {error && <Error>{error}</Error>}
          </Form>
        )}
      </Flex>
      <Flex border align="center" justify="center" padding="1em" margin="1em 0">
        <Text dim padding="0 0.25em">
          {registering ? "Have an account?" : "Don't have an account?"}
        </Text>

        <Anchor
          onClick={() => setLoading(true)}
          to={registering ? "/login" : "/register"}
        >
          <Text dim bold>
            {registering ? "Login" : "Sign Up"}
          </Text>
        </Anchor>
      </Flex>
    </Container>
  );
};

export default Authenticate;
