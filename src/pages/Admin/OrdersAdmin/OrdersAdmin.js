import React, { useState, useEffect, useRef } from 'react';
import { ORDER_STATUS } from '../../../utils/constants';
import { useHistory } from 'react-router-dom';
import { size } from 'lodash';
import { useTable, useTableBooking } from '../../../hooks';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { Badge } from 'primereact/badge';
import { Dialog } from 'primereact/dialog';
import { Tooltip } from 'primereact/tooltip';
import { ProgressSpinner } from 'primereact/progressspinner';
import { DataView, DataViewLayoutOptions } from 'primereact/dataview';
import { Tag } from 'primereact/tag';
import './OrdersAdmin.scss';

export function OrdersAdmin() {

  const toast = useRef(null);
  const intervalRef = useRef();
  const history = useHistory();
  const { loading, tables, getTables } = useTable();
  const { resetKey } = useTableBooking();
  const [refreshTables, setRefreshTables] = useState(false);
  const [tablesCrud, setTablesCrud] = useState([]);
  const [layout, setLayout] = useState('grid');
  const [resetkeyDialog, setResetKeyDialog] = useState(false);
  const [tableKeyReset, setTableKeyReset] = useState(null);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);

  const onRefresh = () => setRefreshTables((state) => !state);

  useEffect(() => {
    const autoRefreshTables = () => {
      onRefresh();
    }

    if (autoRefreshEnabled) {
      intervalRef.current = setInterval(autoRefreshTables, 10000);
    }

    return () => {
      clearInterval(intervalRef.current);
    };
  }, [autoRefreshEnabled]);

  useEffect(() => {
    getTables();
  }, [getTables, refreshTables])

  useEffect(() => {
    if (tables) {
      const filteredTables = tables.filter(table => table.active);
      filteredTables.sort((a, b) => {
        if (a.tableBooking != null && b.tableBooking == null) {
          return -1;
        } else if (a.tableBooking == null && b.tableBooking != null) {
          return 1;
        } else {
          return 0;
        }
      });
      setTablesCrud(filteredTables);
    }
  }, [tables]);

  const showError = (error) => {
    toast.current.show({ severity: 'error', summary: 'Operacion Fallida', detail: error.message, life: 3000 });
  }

  const hideResetKeyDialog = () => {
    setResetKeyDialog(false);
    setAutoRefreshEnabled(true);
  };

  const getSeverity = (table) => {

    if (table.tableBooking === null) {
      return 'success';
    }

    return 'danger';
  };

  const onResetKey = (table) => {
    setResetKeyDialog(true);
    setAutoRefreshEnabled(false);
    setTableKeyReset(table);
  }

  const resetKeyTable = async () => {

    try {
      await resetKey(tableKeyReset.tableBooking.id);
      onRefresh();
      toast.current.show({ severity: 'success', summary: 'Operación Exitosa', detail: `Se ha restablecido la contraseña de la mesa número ${tableKeyReset.number} correctamente`, life: 3000 });
    } catch (error) {
      showError(error);
    }

    setResetKeyDialog(false);
    setAutoRefreshEnabled(true);
  }

  const resetKeyDialogFooter = (
    <React.Fragment>
      <Button label="No" icon="pi pi-times" outlined onClick={hideResetKeyDialog} />
      <Button label="Si" icon="pi pi-check" onClick={resetKeyTable} />
    </React.Fragment>
  );

  const listItem = (table) => {

    const ordersPending = size(table.tableBooking?.orders.filter(order => order.status === ORDER_STATUS.PENDING));

    const renderDetails = () => {
      history.push(`/admin/table/${table.id}`);
    }

    return (
      <div className="col-12">
        <div className="flex flex-column xl:flex-row p-4 gap-4">
          <img className="w-9 sm:w-16rem xl:w-10rem shadow-2 block xl:block mx-auto border-round" src="https://res.cloudinary.com/djwjh0wpw/image/upload/v1679927284/mesa_h2bdwt.jpg" alt={table.number} />
          <div className="flex flex-column sm:flex-row justify-content-between align-items-center flex-1 gap-4">
            <div className="flex flex-column align-items-center sm:align-items-start gap-3">
              <div className="text-2xl font-bold text-900">Mesa {table.number}</div>
              <div className="flex align-items-center gap-3">
                {table.tableBooking === null ? null :
                  <span className="flex align-items-center gap-2">
                    {size(table.tableBooking.payments) > 0 ?
                      <i>Cuenta: <Badge value={'€'} style={{ background: '#A855F7' }}></Badge></i>
                      :
                      <i>Pedidos pendientes: <Badge value={ordersPending > 0 ? ordersPending : 0} severity="warning"></Badge></i>
                    }
                  </span>
                }
                <Tag value={table.tableBooking === null ? 'VACÍA' : 'OCUPADA'} severity={getSeverity(table)}></Tag>
                <div className="flex flex-column align-items-center gap-3" style={{marginBottom: '2rem'}}>
                  {table.tableBooking &&
                    <div className="flex align-items-center gap-2">
                      <Button label="Regenerar contraseña" icon="pi pi-refresh" onClick={(event) => { event.stopPropagation(); onResetKey(table); }} rounded />
                    </div>
                  }
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Button icon="pi pi-shopping-cart" label="Ver Pedidos" onClick={renderDetails} disabled={table.tableBooking === null} />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const gridItem = (table) => {

    const ordersPending = size(table.tableBooking?.orders.filter(order => order.status === ORDER_STATUS.PENDING));

    const renderDetails = () => {
      if (table.tableBooking === null) {
        toast.current.show({ severity: 'info', summary: 'Mesa vacía', detail: 'Los detalles de la mesa no están disponibles cuando esta vacía.', life: 3000 });
      }

      else {
        history.push(`/admin/table/${table.id}`);
      }
    }

    return (
      <div className="col-12 sm:col-6 lg:col-12 xl:col-4 p-2" onClick={renderDetails}>
        <div className="p-4 border-1 surface-border surface-card border-round">
          <div className="flex flex-wrap align-items-center justify-content-between gap-2">
            <div className="flex align-items-center gap-2">
              {table.tableBooking === null ? null :
                <>
                  {size(table.tableBooking.payments) > 0 ?
                    <i className="pi pi-shopping-cart mr-4 p-text-secondary p-overlay-badge" style={{ fontSize: '2rem' }}>
                      <Badge value={'€'} style={{ background: '#A855F7' }}></Badge>
                    </i>
                    :
                    <i className="pi pi-shopping-cart mr-4 p-text-secondary p-overlay-badge" style={{ fontSize: '2rem' }}>
                      <Badge value={ordersPending > 0 ? ordersPending : 0} severity="warning"></Badge>
                    </i>
                  }
                </>
              }
            </div>
            <Tag value={table.tableBooking === null ? 'VACÍA' : 'OCUPADA'} severity={getSeverity(table)}></Tag>
          </div>
          <div className="flex flex-column align-items-center gap-3 py-5">
            <img className="w-9 shadow-2 border-round" src="https://res.cloudinary.com/djwjh0wpw/image/upload/v1679927284/mesa_h2bdwt.jpg" alt={table.number} />
            <div className="text-2xl font-bold">Mesa {table.number}</div>
          </div>

          <div className="flex flex-column align-items-center gap-3">
            {table.tableBooking &&
              <div className="flex align-items-center gap-2">
                <Button label="Regenerar contraseña" icon="pi pi-refresh" onClick={(event) => { event.stopPropagation(); onResetKey(table); }} rounded />
              </div>
            }
          </div>

        </div>
      </div>
    );
  };

  const itemTemplate = (table, layout) => {
    if (!table) {
      return;
    }

    if (layout === 'list') return listItem(table);
    else if (layout === 'grid') return gridItem(table);
  };

  const header = () => {
    return (
      <div className="grid grid-nogutter">
        <div className="col-6 textHeader">
          <h3 className="m-0">PANEL DE PEDIDOS MESAS</h3>
        </div>
        <div className="col-6" style={{ textAlign: 'right' }}>
          <DataViewLayoutOptions layout={layout} onChange={(e) => setLayout(e.value)} />
        </div>
      </div>
    );
  };

  return (
    <div className="card">
      <Toast ref={toast} />
      {loading ?
        <div className="align-container">
          <ProgressSpinner />
        </div>
        :
        <>
          <DataView value={tablesCrud} itemTemplate={itemTemplate} layout={layout} header={header()} emptyMessage='No se ha encontrado ninguna mesa' />

          <Dialog visible={resetkeyDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Confirmar" modal footer={resetKeyDialogFooter} onHide={hideResetKeyDialog}>
            <div className="confirmation-content">
              <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
              {tableKeyReset &&
                <span>Seguro que quieres regenerar la contraseña de la mesa <b>{tableKeyReset.number}</b>?</span>
              }
            </div>
          </Dialog>
        </>
      }
    </div>
  )
}