import React from 'react';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
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
        <div key={index} className="flex flex-col md:flex-row md:items-center gap-2 mb-4 md:mb-2 p-3 md:p-0 border md:border-0 rounded-md bg-gray-50 md:bg-transparent">
          <div className="flex items-center justify-between md:justify-start gap-2">
            <Space>
              <Switch
                size="small"
                checked={item.enabled}
                onChange={(checked) => updateItem(index, 'enabled', checked)}
              />
              <span className="md:hidden text-xs text-gray-400">Enabled</span>
            </Space>
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => removeItem(index)}
              className="md:hidden"
            />
          </div>
          
          <div className="flex flex-col md:flex-row flex-1 gap-2">
            <Input
              placeholder={placeholder.key}
              value={item.key}
              onChange={(e) => updateItem(index, 'key', e.target.value)}
              className={`${!item.enabled ? 'opacity-50' : ''} font-mono text-sm`}
            />
            <Input
              placeholder={placeholder.value}
              value={item.value}
              onChange={(e) => updateItem(index, 'value', e.target.value)}
              className={`${!item.enabled ? 'opacity-50' : ''} font-mono text-sm`}
            />
          </div>

          <Tooltip title="Delete" className="hidden md:block">
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
        size="large"
        className="mt-2"
      >
        Add Item
      </Button>
    </div>
  );
};

export default KeyValueEditor;
