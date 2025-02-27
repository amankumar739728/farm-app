import { useApi } from '../utils/api';

export const useSampleApi = () => {
  const api = useApi();

  const getData = async () => {
    try {
      if (!api) {
        console.error('No API instance available');
        return;
      }

      const response = await api.get('/v1/sample/response/Aman');
      console.log('API Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching sample response:', error);
      throw error;
    }
  };

  return { getData };
};
