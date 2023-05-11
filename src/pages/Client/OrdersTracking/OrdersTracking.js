import React, { useState, useEffect, useRef } from 'react';
import { ORDER_STATUS } from '../../../utils/constants';
import { useParams, useHistory } from 'react-router-dom';
import { useOrder, useTable } from '../../../hooks';
import { Header } from '../../../components/Client';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Tag } from 'primereact/tag';
import { map, size } from "lodash";
import moment from 'moment';
import 'moment/locale/es';
import '../../../scss/AlignComponent.scss';
import './OrdersTracking.scss';

export function OrdersTracking() {

    const intervalRef = useRef();
    const paramsURL = useParams();
    const history = useHistory();
    const { tables, getTableClient } = useTable();
    const { loading, orders, getOrdersByTableClient } = useOrder();

    const [table, setTable] = useState(null);
    const [ordersTable, setOrdersTable] = useState(null);
    const [refreshOrders, setRefreshOrders] = useState(false);

    const onRefreshOrders = () => setRefreshOrders((prev) => !prev);

    useEffect(() => {
        const autoRefreshTables = () => {
            onRefreshOrders();
        }

        intervalRef.current = setInterval(autoRefreshTables, 10000);

        return () => {
            clearInterval(intervalRef.current);
        };
    }, []);

    useEffect(() => {
        getTableClient(paramsURL.idTable);
    }, [paramsURL.idTable, getTableClient]);

    useEffect(() => {
        if (tables) {
            setTable(tables);
        }
    }, [tables]);

    useEffect(() => {
        (async () => {
            if (table) {
                getOrdersByTableClient(table.tableBooking?.id);
            }
        })();
    }, [table, getOrdersByTableClient, refreshOrders]);

    useEffect(() => {
        if (orders) {
            setOrdersTable(orders);
        }
    }, [orders]);

    const getSeverity = (order) => {
        switch (order.status) {
            case ORDER_STATUS.DELIVERED:
                return 'success';

            case ORDER_STATUS.PENDING:
                return 'warning';

            case ORDER_STATUS.PREPARED:
                return 'warning';

            default:
                return null;
        }
    };

    const goBack = () => {
        history.push(`/client/table=${paramsURL.idTable}`);
    };

    return (
        <div className="card">
            {loading ?
                <div className="align-content-mobile">
                    <ProgressSpinner />
                </div>
                :
                <Header name="Pedidos de la mesa" isMain={false} goBack={goBack} paramsURL={paramsURL} />
            }
            <>
                {size(ordersTable) === 0 ?
                    <div className='noOrders-container'>
                        <div className='noOrder_container'>
                            <p>No hay pedidos actualmente</p>
                        </div>
                    </div>
                    :
                    <div className='orders-container'>
                        {map(ordersTable, (order) => (
                            <div key={order.id} className='order_container'>
                                <div className='content_order'>
                                    <img className="w-4 sm:w-8rem xl:w-8rem block xl:block border-round" src={order.product.image} alt={order.product.title} />
                                    <div className='content_order_info'>
                                        <span className="font-bold text-900">{order.product.title}</span>
                                        <span>{moment(order.createdAt).format('HH:mm')}</span>
                                    </div>
                                </div>
                                <div style={{ textAlign: "center" }}>
                                    <Tag value={order.status === ORDER_STATUS.PENDING ? 'PENDIENTE'
                                        : order.status === ORDER_STATUS.DELIVERED ? 'ENTREGADO' : 'PREPARADO'}
                                        severity={getSeverity(order)}
                                    ></Tag>
                                    {order.payment ?
                                        <div style={{ marginTop: "1rem" }}>
                                            <span className="text-green-500 font-medium">Pagado</span>
                                        </div>
                                        :
                                        <div style={{ marginTop: "1rem" }}>
                                            <span className="text-red-500 font-medium">No pagado</span>
                                        </div>
                                    }
                                </div>
                            </div>
                        ))}
                    </div>
                }
            </>
        </div>
    )
}
