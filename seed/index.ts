import { seedCategories } from './category.seed';
import { seedProducts } from './product.seed';

const main = async () => {
  try {
    await seedCategories();
    await seedProducts();

    console.log('Seed Successfully');
  } catch (error) {
    console.log(error);
  }
};

main();
