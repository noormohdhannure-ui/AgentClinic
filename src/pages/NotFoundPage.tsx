import { Layout } from "../components/Layout.js";

export function NotFoundPage() {
  return (
    <Layout title="Page not found – AgentClinic">
      <div class="page-header">
        <p class="eyebrow">404</p>
        <h1>Page not found</h1>
        <p class="lead">We couldn't find that page.</p>
      </div>
      <a class="button" href="/">
        Back to the home page
      </a>
    </Layout>
  );
}
