import { seedAreas } from './area.seed';
import { seedCategories } from './category.seed';
import { seedCustomerTables } from './customerTables.seed';
import { seedProducts } from './product.seed';

const main = async () => {
  try {
    await seedCategories();
    await seedProducts();
    await seedAreas();
    await seedCustomerTables();

    console.log('Seed Successfully');
  } catch (error) {
    console.log(error);
  }
};

main();
