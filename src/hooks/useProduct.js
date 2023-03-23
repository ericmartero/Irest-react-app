import { useState, useCallback } from "react";
import { getProductsApi, addProductApi, updateProductApi, deleteProductApi } from '../api/product';
import { useAuth } from './';

export function useProduct() {

    const [products, setProducts] = useState(null);
    const { auth } = useAuth();

    const getProducts = useCallback( async () => {
        try {
            const response = await getProductsApi();
            setProducts(response);
        } catch (error) {
            throw error;
        }
    }, []);

    const addProduct = async (data) => {
        try {
            await addProductApi(data, auth.token);
        } catch (error) {
            throw error;
        }
    }

    const updateProduct = async (id, data) => {
        try {
            await updateProductApi(id, data, auth.token);
        } catch (error) {
            throw error;
        }
    }

    const deleteProduct = async (id) => {
        try {
            await deleteProductApi(id, auth.token);
        } catch (error) {
            throw error;
        }
    }

    return {
        products,
        getProducts,
        addProduct,
        updateProduct,
        deleteProduct,
    }
}