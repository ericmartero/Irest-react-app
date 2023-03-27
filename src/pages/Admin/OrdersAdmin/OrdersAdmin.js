import React, { useState, useEffect } from 'react';
import { useTable } from '../../../hooks';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { DataView, DataViewLayoutOptions } from 'primereact/dataview';
import { Rating } from 'primereact/rating';
import { Tag } from 'primereact/tag';

export function OrdersAdmin() {

  const { tables, getTables } = useTable();
  const [tablesCrud, setTablesCrud] = useState([]);
  const [layout, setLayout] = useState('grid');
  
  const [sortKey, setSortKey] = useState('');
  const [sortOrder, setSortOrder] = useState(0);
  const [sortField, setSortField] = useState('');

  const sortOptions = [
      { label: 'Vacias', value: '!tableBooking' },
      { label: 'Ocupadas', value: 'tableBooking' }
  ];

  useEffect(() => {
    getTables();
  }, [getTables])

  useEffect(() => {
    if (tables) {
      setTablesCrud(tables);
    }
  }, [tables]);

  const getSeverity = (table) => {

    if (table.tableBooking === null ) {
      return 'success';
    }

    return 'danger';
  };

  const onSortChange = (event) => {
    const value = event.value;

    if (value.indexOf('!') === 0) {
      setSortOrder(-1);
      setSortField(value.substring(1, value.length));
      setSortKey(value);
    } else {
      setSortOrder(1);
      setSortField(value);
      setSortKey(value);
    }
  };

  const listItem = (table) => {
    return (
      <div className="col-12">
        <div className="flex flex-column xl:flex-row xl:align-items-start p-4 gap-4">
          <img className="w-9 sm:w-16rem xl:w-10rem shadow-2 block xl:block mx-auto border-round" src="https://res.cloudinary.com/djwjh0wpw/image/upload/v1679927284/mesa_h2bdwt.jpg" alt={table.number} />
          <div className="flex flex-column sm:flex-row justify-content-between align-items-center xl:align-items-start flex-1 gap-4">
            <div className="flex flex-column align-items-center sm:align-items-start gap-3">
              <div className="text-2xl font-bold text-900">Mesa {table.number}</div>
              <Rating value={table.rating} readOnly cancel={false}></Rating>
              <div className="flex align-items-center gap-3">
                <span className="flex align-items-center gap-2">
                  <i className="pi pi-tag"></i>
                  <span className="font-semibold">{table.category}</span>
                </span>
                <Tag value={table.tableBooking === null ? 'VACIA' : 'OCUPADA'} severity={getSeverity(table)}></Tag>
              </div>
            </div>
            <div className="flex sm:flex-column align-items-center sm:align-items-end gap-3 sm:gap-2">
              <span className="text-2xl font-semibold">${table.price}</span>
              <Button icon="pi pi-shopping-cart" className="p-button-rounded" disabled={table.inventoryStatus === 'OUTOFSTOCK'}></Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const gridItem = (table) => {
    return (
      <div className="col-12 sm:col-6 lg:col-12 xl:col-4 p-2">
        <div className="p-4 border-1 surface-border surface-card border-round">
          <div className="flex flex-wrap align-items-center justify-content-between gap-2">
            <div className="flex align-items-center gap-2">
              <i className="pi pi-tag"></i>
              <span className="font-semibold">{table.category}</span>
            </div>
            <Tag value={table.tableBooking === null ? 'VACIA' : 'OCUPADA'} severity={getSeverity(table)}></Tag>
          </div>
          <div className="flex flex-column align-items-center gap-3 py-5">
            <img className="w-9 shadow-2 border-round" src="https://res.cloudinary.com/djwjh0wpw/image/upload/v1679927284/mesa_h2bdwt.jpg" alt={table.number} />
            <div className="text-2xl font-bold">Mesa {table.number}</div>
            <Rating value={table.rating} readOnly cancel={false}></Rating>
          </div>
          <div className="flex align-items-center justify-content-between">
            <span className="text-2xl font-semibold">${table.price}</span>
            <Button icon="pi pi-shopping-cart" className="p-button-rounded" disabled={table.inventoryStatus === 'OUTOFSTOCK'}></Button>
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
        <div className="col-6" style={{ textAlign: 'left' }}>
          <Dropdown value={sortKey} options={sortOptions} optionLabel="label" placeholder="Ordenar por estado" onChange={onSortChange} />
        </div>
        <div className="col-6" style={{ textAlign: 'right' }}>
          <DataViewLayoutOptions layout={layout} onChange={(e) => setLayout(e.value)} />
        </div>
      </div>
    );
  };

  return (
    <div className="card">
      <DataView value={tablesCrud} itemTemplate={itemTemplate} layout={layout} header={header()} sortField={sortField} sortOrder={sortOrder} />
    </div>
  )
}

