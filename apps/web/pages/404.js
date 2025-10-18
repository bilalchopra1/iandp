import MinimalError from '../components/MinimalError';

export default function Custom404() {
  return <MinimalError statusCode={404} title="This page could not be found." />;
}
