import React from 'react';
import { PlusOutlined, DeleteOutlined, CheckOutlined } from '@ant-design/icons';
import { Input, Button, Switch, Space, Tooltip } from 'antd';
import type { KeyValueItem } from '../types';

interface KeyValueEditorProps {
  items: KeyValueItem[];
  onChange: (items: KeyValueItem[]) => void;
  placeholder?: { key: string; value: string };
}

export const KeyValueEditor: React.FC<KeyValueEditorProps> = ({
  items,
  onChange,
  placeholder = { key: 'Key', value: 'Value' },
}) => {
  const updateItem = (index: number, field: keyof KeyValueItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    onChange(newItems);
  };

  const addItem = () => {
    onChange([...items, { key: '', value: '', enabled: true }]);
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className="key-value-editor">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2 mb-2">
          <Switch
            size="small"
            checked={item.enabled}
            onChange={(checked) => updateItem(index, 'enabled', checked)}
          />
          <Input
            placeholder={placeholder.key}
            value={item.key}
            onChange={(e) => updateItem(index, 'key', e.target.value)}
            className={!item.enabled ? 'opacity-50' : ''}
          />
          <Input
            placeholder={placeholder.value}
            value={item.value}
            onChange={(e) => updateItem(index, 'value', e.target.value)}
            className={!item.enabled ? 'opacity-50' : ''}
          />
          <Tooltip title="Delete">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => removeItem(index)}
            />
          </Tooltip>
        </div>
      ))}
      <Button
        type="dashed"
        icon={<PlusOutlined />}
        onClick={addItem}
        block
      >
        Add Item
      </Button>
    </div>
  );
};

export default KeyValueEditor;
