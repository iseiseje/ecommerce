import { supabase } from '../utils/supabase';

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  created_at?: string;
}

export const ALL_CATEGORY_TAB: CategoryItem = {
  id: 'all',
  name: 'Semua',
  slug: 'all',
  icon: '🔥',
};

/**
 * Fetch all categories 100% dynamically from Supabase DB.
 * Removes static mock arrays and prepends the fixed "Semua" filter tab for UI.
 */
export const getCategories = async (): Promise<CategoryItem[]> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .neq('slug', 'all')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching categories from Supabase:', error.message || error);
      return [ALL_CATEGORY_TAB];
    }

    if (!data || data.length === 0) {
      console.log('No categories found in Supabase DB categories table.');
      return [ALL_CATEGORY_TAB];
    }

    return [ALL_CATEGORY_TAB, ...data];
  } catch (e) {
    console.error('Failed to query categories from Supabase:', e);
    return [ALL_CATEGORY_TAB];
  }
};

/**
 * Add a new category to Supabase DB
 */
export const addCategory = async (name: string, icon: string = '🏷️', slug?: string): Promise<CategoryItem | null> => {
  const categorySlug = slug || name.toLowerCase().trim().replace(/\s+/g, '-');
  try {
    const { data, error } = await supabase
      .from('categories')
      .insert([
        {
          name,
          icon,
          slug: categorySlug,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error adding category:', error);
      throw error;
    }
    return data;
  } catch (e) {
    console.error('Failed to insert category to Supabase:', e);
    throw e;
  }
};

/**
 * Update an existing category in Supabase DB
 */
export const updateCategory = async (
  id: string,
  name: string,
  icon: string = '🏷️',
  slug?: string
): Promise<CategoryItem | null> => {
  const categorySlug = slug || name.toLowerCase().trim().replace(/\s+/g, '-');
  try {
    const { data, error } = await supabase
      .from('categories')
      .update({
        name,
        icon,
        slug: categorySlug,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating category:', error);
      throw error;
    }
    return data;
  } catch (e) {
    console.error('Failed to update category in Supabase:', e);
    throw e;
  }
};

/**
 * Delete a category from Supabase DB
 */
export const deleteCategory = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) {
      console.error('Error deleting category:', error);
      return false;
    }
    return true;
  } catch (e) {
    console.error('Failed to delete category from Supabase:', e);
    return false;
  }
};

/**
 * Realtime Subscription Listener for Supabase Categories table
 * Automatically triggers callback whenever INSERT, UPDATE, or DELETE happens in Supabase!
 */
export const subscribeToCategoryChanges = (onUpdate: () => void) => {
  const channelName = `category-changes-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'categories',
      },
      (payload) => {
        console.log('Realtime Category Event received from Supabase:', payload);
        onUpdate();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};
