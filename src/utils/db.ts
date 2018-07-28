export const triggers = {
  onUpdate: (table: string) => `
    CREATE TRIGGER ${table}_updated_at
    BEFORE UPDATE ON ${table}
    FOR EACH ROW
    EXECUTE PROCEDURE on_update_timestamp();
  `,

  onUpdateDrop: (table: string) => `
    DROP TRIGGER ${table}_updated_at ON ${table};
  `,
};
