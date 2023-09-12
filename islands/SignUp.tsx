import { useContext, useRef, useState } from 'preact/hooks';
import { create_auth_cookie, get_auth_client } from '../services/Authentication.tsx';


export interface SignUpProps {
    redirect?: string;
    supabaseUrl: string;
    supabaseKey: string;
}

export const SignUp = (props: SignUpProps) => {
    const auth_client = get_auth_client(props.supabaseUrl, props.supabaseKey);

    const cookie_submit_form_ref = useRef<HTMLFormElement>(null);
    const [formEditable, setFormEditable] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');

    let formSubmitable = false;

    const _handleLoginSubmit = async (e: React.FormEvent) => {
        const target = e.target as HTMLFormElement;

        setFormEditable(false);

        if (!formSubmitable) {
            e.preventDefault();
        }

        const form_data = new FormData(target);

        const email = form_data.get('email') as string;
        const password = form_data.get('password') as string;
        const signup_response  = await auth_client.signUp(email, password); 

        let { data, error } = signup_response;

        if (error) {
            e.preventDefault();
            setErrorMessage(error.message);

        } else {
            const submitted = create_auth_cookie(data);
            if (cookie_submit_form_ref.current) {
                const cookie_input = cookie_submit_form_ref.current.querySelector('input[name="cookie"]');
                cookie_input?.setAttribute('value', submitted);
                cookie_submit_form_ref.current.submit();
            }
        }
    };

    return <>
      <form className='hidden' action='/auth' method='POST' ref={cookie_submit_form_ref}>
            <input type='text' name='cookie' />
        </form>
        <form className="m-auto border border-cyan-400" action="" method="post"  onSubmit={(e) => _handleLoginSubmit(e)}>
            <h3>Sign up for Cloudboard!</h3>

            <div className="form-control w-full max-w-xs">
                <label className="label" htmlFor="email">
                    <span className="label-text">What is your email?</span>
                </label>
                <input type="email" name="email" placeholder="john@doh.com   " className="input input-bordered w-full max-w-xs" />
            </div>
            <div className="form-control w-full max-w-xs">
                <label className="label" htmlFor="username">
                    <span className="label-text">Select a username</span>
                </label>
                <input type="text" name="username" placeholder="john@doh.com   " className="input input-bordered w-full max-w-xs" />
            </div>
            <div className="form-control w-full max-w-xs">
                <label className="label" htmlFor="password">
                    <span className="label-text">Password</span>
                </label>
                <input type="password" name="password" className="input input-bordered w-full max-w-xs" />
            </div>
            <button className="btn">Sign Up</button>
        </form>
    </>;
};
