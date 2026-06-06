import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Play, Save, Power, PowerOff, ChevronDown, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface Condition {
  id: string;
  indicator: string;
  comparator: string;
  value: string;
}

interface Strategy {
  id: string;
  name: string;
  description: string;
  asset: string;
  entryConditions: Condition[];
  exitConditions: Condition[];
  active: boolean;
}

const indicatorOptions = ['RSI', 'SMA', 'EMA', 'MACD', 'Price', 'Volume', 'Bollinger Upper', 'Bollinger Lower'];
const comparatorOptions = [
  { value: '<', label: 'Less than' },
  { value: '>', label: 'Greater than' },
  { value: '<=', label: 'Less or equal' },
  { value: '>=', label: 'Greater or equal' },
  { value: 'crosses_above', label: 'Crosses above' },
  { value: 'crosses_below', label: 'Crosses below' },
];

interface StrategyBuilderProps {
  onRunBacktest?: (strategy: Strategy) => void;
}

export default function StrategyBuilder({ onRunBacktest }: StrategyBuilderProps) {
  const [strategies, setStrategies] = useState<Strategy[]>([
    {
      id: '1',
      name: 'RSI Reversal',
      description: 'Buy when RSI is oversold, sell when overbought',
      asset: 'AAPL',
      entryConditions: [{ id: 'e1', indicator: 'RSI', comparator: '<', value: '30' }],
      exitConditions: [{ id: 'x1', indicator: 'RSI', comparator: '>', value: '70' }],
      active: true,
    },
  ]);

  const [editingStrategy, setEditingStrategy] = useState<Strategy | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [asset, setAsset] = useState('AAPL');
  const [entryConditions, setEntryConditions] = useState<Condition[]>([]);
  const [exitConditions, setExitConditions] = useState<Condition[]>([]);

  const createId = () => Math.random().toString(36).slice(2, 9);

  const addCondition = (type: 'entry' | 'exit') => {
    const newCondition: Condition = {
      id: createId(),
      indicator: 'RSI',
      comparator: '<',
      value: '30',
    };
    if (type === 'entry') {
      setEntryConditions([...entryConditions, newCondition]);
    } else {
      setExitConditions([...exitConditions, newCondition]);
    }
  };

  const updateCondition = (type: 'entry' | 'exit', id: string, field: string, value: string) => {
    const setter = type === 'entry' ? setEntryConditions : setExitConditions;
    const list = type === 'entry' ? entryConditions : exitConditions;
    setter(list.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  };

  const removeCondition = (type: 'entry' | 'exit', id: string) => {
    const setter = type === 'entry' ? setEntryConditions : setExitConditions;
    const list = type === 'entry' ? entryConditions : exitConditions;
    setter(list.filter((c) => c.id !== id));
  };

  const handleSave = () => {
    if (!name.trim()) {
      toast.error('Please enter a strategy name');
      return;
    }
    if (entryConditions.length === 0) {
      toast.error('Add at least one entry condition');
      return;
    }

    const newStrategy: Strategy = {
      id: editingStrategy?.id || createId(),
      name,
      description,
      asset,
      entryConditions,
      exitConditions,
      active: false,
    };

    if (editingStrategy) {
      setStrategies(strategies.map((s) => (s.id === editingStrategy.id ? newStrategy : s)));
    } else {
      setStrategies([...strategies, newStrategy]);
    }

    toast.success(editingStrategy ? 'Strategy updated' : 'Strategy saved');
    resetForm();
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setAsset('AAPL');
    setEntryConditions([]);
    setExitConditions([]);
    setEditingStrategy(null);
  };

  const toggleActive = (id: string) => {
    setStrategies(strategies.map((s) => (s.id === id ? { ...s, active: !s.active } : s)));
  };

  const deleteStrategy = (id: string) => {
    setStrategies(strategies.filter((s) => s.id !== id));
    toast.success('Strategy deleted');
  };

  const editStrategy = (strategy: Strategy) => {
    setEditingStrategy(strategy);
    setName(strategy.name);
    setDescription(strategy.description);
    setAsset(strategy.asset);
    setEntryConditions([...strategy.entryConditions]);
    setExitConditions([...strategy.exitConditions]);
  };

  const ConditionRow = ({ condition, type }: { condition: Condition; type: 'entry' | 'exit' }) => (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className="flex flex-wrap items-center gap-2"
    >
      <select
        value={condition.indicator}
        onChange={(e) => updateCondition(type, condition.id, 'indicator', e.target.value)}
        className="px-3 py-2 bg-dark-700/50 border border-white/5 rounded-lg text-sm text-white focus:outline-none focus:border-accent-cyan/50"
      >
        {indicatorOptions.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>

      <select
        value={condition.comparator}
        onChange={(e) => updateCondition(type, condition.id, 'comparator', e.target.value)}
        className="px-3 py-2 bg-dark-700/50 border border-white/5 rounded-lg text-sm text-white focus:outline-none focus:border-accent-cyan/50"
      >
        {comparatorOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>

      <input
        type="text"
        value={condition.value}
        onChange={(e) => updateCondition(type, condition.id, 'value', e.target.value)}
        className="w-24 px-3 py-2 bg-dark-700/50 border border-white/5 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-accent-cyan/50"
        placeholder="Value"
      />

      <button
        onClick={() => removeCondition(type, condition.id)}
        className="p-2 rounded-lg hover:bg-accent-red/10 text-dark-400 hover:text-accent-red transition-colors"
      >
        <Trash2 size={14} />
      </button>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Strategy Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-dark-800/50 backdrop-blur-xl border border-white/5 rounded-2xl p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-5">
          {editingStrategy ? 'Edit Strategy' : 'Create Strategy'}
        </h3>

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="text-xs font-medium text-dark-300 uppercase tracking-wider mb-1.5 block">Strategy Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., RSI Reversal Strategy"
              className="w-full px-4 py-2.5 bg-dark-700/50 border border-white/5 rounded-xl text-white text-sm focus:outline-none focus:border-accent-cyan/50"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-medium text-dark-300 uppercase tracking-wider mb-1.5 block">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your strategy..."
              rows={2}
              className="w-full px-4 py-2.5 bg-dark-700/50 border border-white/5 rounded-xl text-white text-sm focus:outline-none focus:border-accent-cyan/50 resize-none"
            />
          </div>

          {/* Asset */}
          <div>
            <label className="text-xs font-medium text-dark-300 uppercase tracking-wider mb-1.5 block">Apply to Asset</label>
            <input
              type="text"
              value={asset}
              onChange={(e) => setAsset(e.target.value.toUpperCase())}
              placeholder="AAPL"
              className="w-full px-4 py-2.5 bg-dark-700/50 border border-white/5 rounded-xl text-white text-sm font-mono focus:outline-none focus:border-accent-cyan/50"
            />
          </div>

          {/* Entry Conditions */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-medium text-accent-green uppercase tracking-wider">Entry Conditions (Buy)</label>
              <button
                onClick={() => addCondition('entry')}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-accent-green/10 text-accent-green text-xs font-medium hover:bg-accent-green/20 transition-colors"
              >
                <Plus size={12} />
                Add
              </button>
            </div>
            <AnimatePresence>
              <div className="space-y-2">
                {entryConditions.map((c) => (
                  <ConditionRow key={c.id} condition={c} type="entry" />
                ))}
              </div>
            </AnimatePresence>
            {entryConditions.length === 0 && (
              <p className="text-xs text-dark-500 py-2">No entry conditions defined</p>
            )}
          </div>

          {/* Exit Conditions */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-medium text-accent-red uppercase tracking-wider">Exit Conditions (Sell)</label>
              <button
                onClick={() => addCondition('exit')}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-accent-red/10 text-accent-red text-xs font-medium hover:bg-accent-red/20 transition-colors"
              >
                <Plus size={12} />
                Add
              </button>
            </div>
            <AnimatePresence>
              <div className="space-y-2">
                {exitConditions.map((c) => (
                  <ConditionRow key={c.id} condition={c} type="exit" />
                ))}
              </div>
            </AnimatePresence>
            {exitConditions.length === 0 && (
              <p className="text-xs text-dark-500 py-2">No exit conditions defined</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent-cyan text-dark-900 font-semibold text-sm hover:bg-accent-cyan/90 transition-colors shadow-glow-cyan"
            >
              <Save size={16} />
              {editingStrategy ? 'Update' : 'Save'} Strategy
            </button>
            {editingStrategy && (
              <button
                onClick={resetForm}
                className="px-5 py-2.5 rounded-xl border border-white/10 text-dark-200 text-sm hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Saved Strategies */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-dark-800/50 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-white/5">
          <h3 className="text-lg font-semibold text-white">Saved Strategies</h3>
        </div>

        {strategies.length > 0 ? (
          <div className="divide-y divide-white/5">
            {strategies.map((strategy) => (
              <div key={strategy.id} className="px-6 py-4 hover:bg-white/5 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-white">{strategy.name}</h4>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        strategy.active
                          ? 'bg-accent-green/10 text-accent-green'
                          : 'bg-dark-600 text-dark-300'
                      }`}>
                        {strategy.active ? 'Active' : 'Inactive'}
                      </span>
                      <span className="text-xs font-mono text-accent-cyan bg-accent-cyan/10 px-1.5 py-0.5 rounded">
                        {strategy.asset}
                      </span>
                    </div>
                    {strategy.description && (
                      <p className="text-xs text-dark-400 mt-1">{strategy.description}</p>
                    )}
                    <div className="flex flex-wrap gap-4 mt-2 text-xs text-dark-300">
                      <span>{strategy.entryConditions.length} entry condition(s)</span>
                      <span>{strategy.exitConditions.length} exit condition(s)</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleActive(strategy.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        strategy.active
                          ? 'text-accent-green hover:bg-accent-green/10'
                          : 'text-dark-400 hover:bg-white/5'
                      }`}
                      title={strategy.active ? 'Deactivate' : 'Activate'}
                    >
                      {strategy.active ? <Power size={16} /> : <PowerOff size={16} />}
                    </button>
                    <button
                      onClick={() => editStrategy(strategy)}
                      className="p-2 rounded-lg text-dark-400 hover:text-accent-cyan hover:bg-accent-cyan/10 transition-colors"
                      title="Edit"
                    >
                      <AlertCircle size={16} />
                    </button>
                    <button
                      onClick={() => onRunBacktest?.(strategy)}
                      className="p-2 rounded-lg text-dark-400 hover:text-accent-purple hover:bg-accent-purple/10 transition-colors"
                      title="Run Backtest"
                    >
                      <Play size={16} />
                    </button>
                    <button
                      onClick={() => deleteStrategy(strategy.id)}
                      className="p-2 rounded-lg text-dark-400 hover:text-accent-red hover:bg-accent-red/10 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-12 text-center">
            <AlertCircle size={40} className="mx-auto mb-3 text-dark-500" />
            <p className="text-dark-300 text-sm">No strategies saved</p>
            <p className="text-dark-500 text-xs mt-1">Create your first trading strategy above</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
