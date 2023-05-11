import React, { useState, useEffect, useRef } from 'react';
import { useCategory } from '../../../hooks';
import { addProductShoppingCart } from '../../../api/shoppingCart';
import { Header } from '../../../components/Client/Header/Header';
import { useParams, useHistory } from 'react-router-dom';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import { map } from "lodash";
import '../../../scss/AlignComponent.scss';
import './Products.scss';

export function Products() {

    const paramsURL = useParams();
    const history = useHistory();
    const toast = useRef(null);
    const { loading, getCategoryById } = useCategory();
    const [productsCateogry, setProductsCateogry] = useState([]);
    const [categoryName, setCategoryName] = useState(null);

    const [refreshCartNumber, setRefreshCartNumber] = useState(false);

    useEffect(() => {
        (async () => {
            const response = await getCategoryById(paramsURL.idCategory);
            setCategoryName(response.title);

            const filteredProducts = response.products.filter(product => product.active);
            setProductsCateogry(filteredProducts);
        })();
    }, [paramsURL.idCategory, getCategoryById]);

    const onRefreshCartNumber = () => setRefreshCartNumber((state) => !state);

    const goBack = () => {
        history.push(`/client/table=${paramsURL.idTable}`);
    };

    const addProductCart = (product) => {
        addProductShoppingCart(product.id);
        onRefreshCartNumber();
        toast.current.show({ severity: 'success', summary: 'Operacion Exitosa', detail: `Se ha añadido el producto ${product.title} correctamente`, life: 1500 });
    };

    return (
        <>
            <Toast ref={toast} position="bottom-center" />
            {loading ?
                <div className="align-content-mobile">
                    <ProgressSpinner />
                </div>
                :
                <>
                    <div className="card">
                        <Header name={categoryName} isMain={false} goBack={goBack} refreshCartNumber={refreshCartNumber} paramsURL={paramsURL} />
                        <div className='products-container'>
                            {map(productsCateogry, (product) => (
                                <div key={product.id} className='product_container'>
                                    <div className='content_product'>
                                        <img className="w-4 sm:w-8rem xl:w-8rem block xl:block border-round" src={product.image} alt={product.title} />
                                        <div className='content_product_info'>
                                            <span className="font-bold text-900">{product.title}</span>
                                            <span>{product.price.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</span>
                                        </div>
                                    </div>
                                    <Button
                                        icon="pi pi-plus" className="layout-button p-button-secondary mr-1"
                                        style={{ flexShrink: 0 }}
                                        onClick={() => addProductCart(product)} />
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            }
        </>
    )
}
