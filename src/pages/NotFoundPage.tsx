import { Layout } from "../components/Layout.js";

export function NotFoundPage() {
  return (
    <Layout title="Page not found – AgentClinic">
      <h1>Page not found</h1>
      <p>We couldn't find that page.</p>
      <p>
        <a href="/">Back to the home page</a>
      </p>
    </Layout>
  );
}
