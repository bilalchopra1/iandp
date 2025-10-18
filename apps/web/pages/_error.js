import MinimalError from '../components/MinimalError';

function ErrorPage({ statusCode }) {
  const title = statusCode === 404 ? 'This page could not be found.' : 'An internal server error occurred.';
  return <MinimalError statusCode={statusCode} title={title} />;
}

ErrorPage.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default ErrorPage;
