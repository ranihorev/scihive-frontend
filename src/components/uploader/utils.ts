import * as queryString from 'query-string';
import { useLocation } from 'react-router';

export const useGetUploadLink = () => {
  const location = useLocation();
  const { upload_link } = queryString.parse(location.search);
  if (typeof upload_link === 'string') return upload_link;
  return undefined;
};
