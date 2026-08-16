"use client";

import axiosInstance from "./axiosInstance";


export const fetchData = async (endpoint, { signal } = {}) => {
  const { data } = await axiosInstance.get(endpoint, {
    signal,
  });

  return data;
};

export const postData = async (endpoint, data, isFormData = false) => {
  const config = isFormData
    ? {} // Axios will automatically set multipart/form-data + boundary
    : {
        headers: {
          "Content-Type": "application/json",
        },
      };

  const res = await axiosInstance.post(endpoint, data, config);
  return res.data;
};

// PATCH (partial update)
export const patchData = async (endpoint, data, isFormData = false) => {
  const config = isFormData
    ? {}
    :  {
        headers: {
          "Content-Type": "application/json",
        },
      };

  const { data: res } = await axiosInstance.patch(endpoint, data, config );
  return res;
};

export const fetchExternalData = async (fullUrl, { signal } = {}) => {
  const { data } = await axios.get(fullUrl, { signal });
  return data;
};

// PUT (full update)
export const updateData = async (endpoint, data) => {
  const { data: res } = await axiosInstance.put(endpoint, data);
  return res;
};

// DELETE request
export const deleteData = async (endpoint) => {
  const { data } = await axiosInstance.delete(endpoint);
  return data;
};
