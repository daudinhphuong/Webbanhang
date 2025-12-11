import { addProductToCart } from '@/apis/cartService';
export const handleAddProductToCartCommon = (
  userId,
  setIsOpen,
  setType,
  toast,
  sizeChoose,
  productId,
  quantity,
  setIsLoading,
  handleGetListProductsCart
) => {
  if (!userId) {
    setIsOpen(true);
    setType('login');
    toast.warning('Please login to add product to cart!');

    return;
  }

  if (!sizeChoose) {
    toast.warning('Please choose size!');
    return;
  }

  const data = {
    userId,
    productId,
    quantity,
    size: sizeChoose,
  };

  setIsLoading(true);
  addProductToCart(data)
    .then((res) => {
      setIsOpen(true);
      setType('cart');
      setIsLoading(false);
      handleGetListProductsCart(userId, 'cart');
    })
    .catch((err) => {
      toast.error('Add Product to cart failed!');
      setIsLoading(false);
    });
};

export const handleTotalPrice = (listProduct) => {
  return listProduct.reduce((acc, item) => {
    return acc + item.total;
  }, 0);
};
