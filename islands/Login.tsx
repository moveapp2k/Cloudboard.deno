import { useContext, useRef, useState } from 'preact/hooks';
import { create_auth_cookie, get_auth_client, AFTER_LOGIN_PATH } from '../services/Authentication.tsx';


export interface LoginProps {
    redirect?: string;
    supabaseUrl: string;
    supabaseKey: string;
}
export const Login = (props: LoginProps) => {

    const auth_client = get_auth_client(props.supabaseUrl, props.supabaseKey);

    const cookie_submit_form_ref = useRef<HTMLFormElement>(null);

    const [errorMessage, setErrorMessage] = useState('');

    let formSubmitable = false;

    const _handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const target = e.target as HTMLFormElement;

        const form_data = new FormData(target);

        const email = form_data.get('email') as string;
        const password = form_data.get('password') as string;
        const login_response = await auth_client.login(email, password);

        localStorage.setItem('login', JSON.stringify(login_response))

        const { error, data } = login_response;

        if (error) {
            setErrorMessage(error.message);

        } else {
            const submitted = create_auth_cookie(data);
            if (cookie_submit_form_ref.current) {
                const cookie_input = cookie_submit_form_ref.current.querySelector('input[name="cookie"]');
                cookie_input?.setAttribute('value', submitted);
                //
                const redirect_input = cookie_submit_form_ref.current.querySelector('input[name="redirect"]');
                redirect_input?.setAttribute('value', props.redirect ?? window.location.href);

                cookie_submit_form_ref.current.submit();
            }
        }
    };
    return <>
        {/* Once the fetch submits the form send the cookie here to be set */}
        <form className='hidden' action={AFTER_LOGIN_PATH} method='POST' ref={cookie_submit_form_ref}>
            <input type='text' name='cookie' />
            <input type='text' name='redirect' />
        </form>
        <Form.Root className="w-[260px]" onSubmit={(e) => _handleLoginSubmit(e)}>
            <Form.Field className="grid mb-[10px]" name="email">
                <div className="flex items-baseline justify-between">
                    <Form.Label className="text-[15px] font-medium leading-[35px] text-white">Email</Form.Label>
                    <Form.Message className="text-[13px] text-white opacity-[0.8]" match="valueMissing">
                        Please enter your email
                    </Form.Message>
                    <Form.Message className="text-[13px] text-white opacity-[0.8]" match="typeMismatch">
                        Please provide a valid email
                    </Form.Message>
                </div>
                <Form.Control asChild>
                    <input
                        className="box-border w-full bg-blackA5 shadow-blackA9 inline-flex h-[35px] appearance-none items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none text-white shadow-[0_0_0_1px] outline-none hover:shadow-[0_0_0_1px_black] focus:shadow-[0_0_0_2px_black] selection:color-white selection:bg-blackA9"
                        type="email"
                        required
                    />
                </Form.Control>
            </Form.Field>
            <Form.Field className="grid mb-[10px]" name="password">
                <div className="flex items-baseline justify-between">
                    <Form.Label className="text-[15px] font-medium leading-[35px] text-white">
                        Question
                    </Form.Label>
                    <Form.Message className="text-[13px] text-white opacity-[0.8]" match="valueMissing">
                        Please enter a question
                    </Form.Message>
                </div>
                <Form.Control asChild>
                    <input type="password"
                        className="box-border w-full bg-blackA5 shadow-blackA9 inline-flex appearance-none items-center justify-center rounded-[4px] p-[10px] text-[15px] leading-none text-white shadow-[0_0_0_1px] outline-none hover:shadow-[0_0_0_1px_black] focus:shadow-[0_0_0_2px_black] selection:color-white selection:bg-blackA9 resize-none"
                        required
                    />
                </Form.Control>
            </Form.Field>
            <Form.Submit asChild>
                <button className="box-border w-full text-violet11 shadow-blackA7 hover:bg-mauve3 inline-flex h-[35px] items-center justify-center rounded-[4px] bg-white px-[15px] font-medium leading-none shadow-[0_2px_10px] focus:shadow-[0_0_0_2px] focus:shadow-black focus:outline-none mt-[10px]">
                    Login
                </button>
            </Form.Submit>
        </Form.Root>

    </>;
};

