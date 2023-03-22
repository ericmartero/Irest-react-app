import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useProduct, useCategory } from '../../hooks';
import { classNames } from 'primereact/utils';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputSwitch } from "primereact/inputswitch";
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Image } from 'primereact/image';
import { useDropzone } from 'react-dropzone';
import { map } from 'lodash';

export function ProductsAdmin() {
  let emptyProduct = {
    title: '',
    imageFile: '',
    image: '',
  };

  const toast = useRef(null);
  const dt = useRef(null);

  const { products, getProducts } = useProduct();
  const { categories, getCategories } = useCategory();

  const [productsTable, setProductsTable] = useState(null);
  const [productDialog, setProductDialog] = useState(false);
  const [deleteProductDialog, setDeleteProductDialog] = useState(false);
  const [deleteProductsDialog, setDeleteProductsDialog] = useState(false);
  const [product, setProduct] = useState(emptyProduct);
  const [selectedProducts, setSelectedProducts] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [globalFilter, setGlobalFilter] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [actionName, setActionName] = useState('');

  const [uploadedImage, setUploadedImage] = useState(false);

  const [isEditProduct, setIsEditProduct] = useState(false)
  const [refreshTable, setRefreshTable] = useState(false);

  const [selectedCategories, setSelectedCategories] = useState(null);
  const [categoriesDropdown, setCategoriesDropdown] = useState([])

  useEffect(() => {
    getProducts();
  }, [refreshTable, getProducts])

  useEffect(() => {
    if (products) {
      setProductsTable(products);
    }
  }, [products]);

  useEffect(() => {
    getCategories();
  }, [getCategories])

  useEffect(() => {
    setCategoriesDropdown(formatDropdownData(categories));
  }, [categories])
  

  const onRefresh = () => setRefreshTable((state) => !state);

  const openNew = () => {
    setIsEditProduct(false);
    setProduct(emptyProduct);
    setSelectedCategories(null);
    setSubmitted(false);
    setProductDialog(true);
    setActionName('Añadir Producto');
  };

  const hideDialog = () => {
    setSubmitted(false);
    setProductDialog(false);
    setValidationErrors({});
    setUploadedImage(false);
  };

  const hideDeleteProductDialog = () => {
    setDeleteProductDialog(false);
  };

  const hideDeleteProductsDialog = () => {
    setDeleteProductsDialog(false);
  };

  const showError = (error) => {
    toast.current.show({ severity: 'error', summary: 'Operación Fallida', detail: error.message, life: 3000 });
  }

  const saveProduct = async () => {

    const isValid = validateFields();
    setSubmitted(true);

    if (isValid) {

      //EDITAR
      if (product.id) {

        const editProduct = {
          ...(product.title && { title: product.title }),
          ...(product.imageFile && { image: product.imageFile }),
        };

        /*try {
          await updateCategory(category.id, editUser);
          onRefresh();
          toast.current.show({ severity: 'success', summary: 'Operación Exitosa', detail: `Categoria ${category.title} actualizada correctamente`, life: 3000 });
        } catch (error) {
          console.log(error);
        }*/

        //ENVIAR
      } else {

        const newProduct = {
          title: product.title,
          image: product.imageFile,
        };

        /*try {
          await addCategory(newCategory);
          onRefresh();
          toast.current.show({ severity: 'success', summary: 'Operacion Exitosa', detail: `Categoria ${category.title} creada correctamente`, life: 3000 });
        } catch (error) {
          console.log(error);
        }*/
      }

      setSubmitted(false);
      setUploadedImage(false);
      setValidationErrors({});
      setProductDialog(false);
      setProduct(emptyProduct);
    }
  };

  const editProduct = (productEdit) => {
    setSubmitted(false);
    setIsEditProduct(true);
    setProduct({ ...productEdit });
    setSelectedCategories(productEdit.category);
    setProductDialog(true);
    setActionName('Editar Producto');
  };

  const confirmDeleteProduct = (product) => {
    setProduct(product);
    setDeleteProductDialog(true);
  };

  const deleteSelectedProduct = async () => {
    /*try {
      await deleteCategory(category.id);
      onRefresh();
    } catch (error) {
      console.log(error);
    }*/

    setDeleteProductDialog(false);
    setProduct(emptyProduct);
    toast.current.show({ severity: 'success', summary: 'Operacion Exitosa', detail: 'Producto borrado correctamente', life: 3000 });
  };

  const exportCSV = () => {
    dt.current.exportCSV();
  };

  const confirmDeleteSelected = () => {
    setDeleteProductsDialog(true);
  };

  const deleteSelectedProducts = async () => {
    /*try {
      await Promise.all(selectedCategories.map(async (category) => {
        await deleteCategory(category.id);
      }));
      onRefresh();
    } catch (error) {
      console.log(error);
    }*/

    setDeleteProductsDialog(false);
    setSelectedProducts(null);

    if (selectedProducts.length === 1) {
      toast.current.show({ severity: 'success', summary: 'Operacion Exitosa', detail: 'Producto borrado correctamente', life: 3000 });
    }

    else {
      toast.current.show({ severity: 'success', summary: 'Operacion Exitosa', detail: 'Productos borrados correctamente', life: 3000 });
    }
  };

  const formatCurrency = (value) => {
    return value.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });
  };

  function formatDropdownData(data) {
    return map(data, (item) => ({
      key: item.id,
      text: item.title,
      value: item.id,
    }));
  }

  const onInputChange = (e, name) => {
    const val = e.target.value || '';

    let errors = { ...validationErrors };

    if (val.length < 2) {
      errors.title = "El nombre del producto tiene que tener mínimo 2 letras";
    } else {
      delete errors.title;
    }

    setProduct(prevProduct => ({ ...prevProduct, [name]: val }));
    setValidationErrors(errors);
  };

  const validateFields = () => {
    const errors = {};

    if (!product.title) {
      errors.title = "El nombre del producto es requerido";
    } else if (product.title.length < 2) {
      errors.title = "El nombre del producto tiene que tener mínimo 2 letras";
    }

    if (!product.image) {
      errors.image = "La imagen es requerida";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const onDrop = useCallback((acceptedFile) => {
    const file = acceptedFile[0];
    setProduct({ ...product, imageFile: file, image: URL.createObjectURL(file) });
    let errors = { ...validationErrors };
    delete errors.image;
    setValidationErrors(errors);
    setUploadedImage(true);
  }, [product, validationErrors]);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpeg'],
    },
    noKeyboard: true,
    multiple: false,
    onDrop
  })

  const leftToolbarTemplate = () => {
    return (
      <div className="flex flex-wrap gap-2">
        <Button label="Nuevo" icon="pi pi-plus" severity="success" onClick={openNew} />
        <Button label="Borrar" icon="pi pi-trash" severity="danger" onClick={confirmDeleteSelected} disabled={!selectedProducts || !selectedProducts.length} />
      </div>
    );
  };

  const rightToolbarTemplate = () => {
    return <Button label="Exportar" icon="pi pi-upload" className="p-button-help" onClick={exportCSV} />;
  };

  const imageBodyTemplate = (rowData) => {
    return <img src={rowData.image} alt={rowData.image} className="shadow-2 border-round" style={{ width: '100px' }} />;
  };

  const activeBodyTemplate = (rowData) => {
    return <i className={classNames('pi', (rowData.active ? 'text-green-500 pi-check-circle' : 'text-red-500 pi-times-circle'))}></i>;
  };

  const priceBodyTemplate = (rowData) => {
    return formatCurrency(rowData.price);
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <React.Fragment>
        <Button icon="pi pi-pencil" rounded outlined className="mr-2" onClick={() => editProduct(rowData)} />
        <Button icon="pi pi-trash" rounded outlined severity="danger" onClick={() => confirmDeleteProduct(rowData)} />
      </React.Fragment>
    );
  };

  const header = (
    <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
      <h3 className="m-0">PANEL DE PRODUCTOS</h3>
      <span className="p-input-icon-left">
        <i className="pi pi-search" />
        <InputText type="search" onInput={(e) => setGlobalFilter(e.target.value)} placeholder="Buscar..." />
      </span>
    </div>
  );
  const productDialogFooter = (
    <React.Fragment>
      <Button label="Cancelar" icon="pi pi-times" outlined onClick={hideDialog} />
      <Button label="Guardar" icon="pi pi-check" onClick={saveProduct} disabled={!submitted || Object.keys(validationErrors).length === 0 ? false : true} />
    </React.Fragment>
  );
  const deleteProductDialogFooter = (
    <React.Fragment>
      <Button label="No" icon="pi pi-times" outlined onClick={hideDeleteProductDialog} />
      <Button label="Si" icon="pi pi-check" severity="danger" onClick={deleteSelectedProduct} />
    </React.Fragment>
  );
  const deleteProductsDialogFooter = (
    <React.Fragment>
      <Button label="No" icon="pi pi-times" outlined onClick={hideDeleteProductsDialog} />
      <Button label="Si" icon="pi pi-check" severity="danger" onClick={deleteSelectedProducts} />
    </React.Fragment>
  );

  return (
    <div>
      <Toast ref={toast} />
      <div className="card" >
        <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>

        <DataTable ref={dt} value={productsTable} selection={selectedProducts} onSelectionChange={(e) => setSelectedProducts(e.value)}
          dataKey="id" paginator rows={10} rowsPerPageOptions={[5, 10, 25]}
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          currentPageReportTemplate="Mostrando del {first} al {last} de {totalRecords} productos" globalFilter={globalFilter} header={header}>
          <Column selectionMode="multiple" exportable={false}></Column>
          <Column field="title" header="Producto" sortable style={{ minWidth: '14rem' }}></Column>
          <Column field="image" header="Imagen" body={imageBodyTemplate} style={{ minWidth: '12rem' }}></Column>
          <Column field="price" header="Precio" body={priceBodyTemplate} sortable style={{ minWidth: '8rem' }}></Column>
          <Column field="category.title" header="Categoría" sortable style={{ minWidth: '12rem' }}></Column>
          <Column field="active" header="Activo" sortable dataType="boolean" body={activeBodyTemplate} style={{ minWidth: '8rem' }}></Column>
          <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '12rem' }}></Column>
        </DataTable>
      </div>

      <Dialog visible={productDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header={actionName} modal className="p-fluid" footer={productDialogFooter} onHide={hideDialog}>
        <div className="field">
          <label htmlFor="title" className="font-bold">
            Producto
          </label>
          <InputText id="title" value={product.title} onChange={(e) => onInputChange(e, 'title')} required autoFocus
            className={classNames({ "p-invalid": submitted && (!product.title || validationErrors.title) })} />
          {submitted && !product.title
            ? (<small className="p-error">El nombre del producto es requerido</small>)
            : submitted && validationErrors.title && (<small className="p-error">{validationErrors.title}</small>)
          }
        </div>

        <div className="field">
          <label htmlFor="price" className="font-bold">
            Precio
          </label>
          <InputNumber inputId="price" value={product.price} onValueChange={(e) => onInputChange(e, 'price')} showButtons buttonLayout="horizontal" step={0.25}
            decrementButtonClassName="p-button-danger" incrementButtonClassName="p-button-success" incrementButtonIcon="pi pi-plus" decrementButtonIcon="pi pi-minus"
            mode="currency" currency="EUR" />
        </div>

        <div className="field">
          <label htmlFor="categoria" className="font-bold">
            Categoría
          </label>
          <Dropdown value={product.category} onChange={(e) => onInputChange(e, 'category')} options={categoriesDropdown} optionLabel="text"
            placeholder="Selecciona una categoría" />
        </div>

        <div className="field" style={{ height: "2.5rem", display: "flex", alignItems: "center" }}>
          <div className="p-field-checkbox" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <InputSwitch
              id='active'
              checked={product.active}
              onChange={(e) => onInputChange(e, 'active')}
            />
            <label htmlFor="active" className="font-bold" style={{ marginLeft: "1rem", alignSelf: "center" }}>
              Usuario Activo
            </label>
          </div>
        </div>

        <div className="field">
          <label htmlFor="image" className="font-bold" style={{ marginBottom: '0.8rem' }}>
            Imagen
          </label>
          <Button label={isEditProduct ? "Cambiar Imagen" : "Subir Imagen"} {...getRootProps()} />
          <input {...getInputProps()} />
          {submitted && validationErrors.image && !uploadedImage && (<small className="p-error">{validationErrors.image}</small>)}
          <div className="imageContent">
            <Image src={product.image} alt="Image" width="100%" />
          </div>

        </div>
      </Dialog>

      <Dialog visible={deleteProductDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Confirmar" modal footer={deleteProductDialogFooter} onHide={hideDeleteProductDialog}>
        <div className="confirmation-content">
          <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
          {product && (
            <span>
              Seguro que quieres eliminar el producto <b>{product.title}</b>?
            </span>
          )}
        </div>
      </Dialog>

      <Dialog visible={deleteProductsDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Confirmar" modal footer={deleteProductsDialogFooter} onHide={hideDeleteProductsDialog}>
        <div className="confirmation-content">
          <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
          {product && <span>Seguro que quieres eliminar los productos seleccionados?</span>}
        </div>
      </Dialog>
    </div>
  );
}
