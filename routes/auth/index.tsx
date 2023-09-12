import type { Handlers, PageProps } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";

interface AuthPageProps {
}

export const handler: Handlers<AuthPageProps> = {
  async GET(_req, ctx) {
    return ctx.render( );
  },
  async POST(_req, ctx) {
    return ctx.render({} );
  }
};

export default function Auth(props: PageProps<AuthPageProps>) {
  return (
    <>
      <Head>
        <title>My Auth Page</title>
      </Head>
        
    </>
  );
}
