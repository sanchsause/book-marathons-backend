import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

// 🔧 Патч: учим JSON.stringify работать с BigInt
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Эндпоинт: Регистрация или обновление пользователя
app.post('/api/users', async (req, res) => {
  try {
    const { telegramId, firstName, lastName, username } = req.body;

    if (!telegramId || !firstName) {
      return res.status(400).json({ error: 'telegramId и firstName обязательны' });
    }

    const user = await prisma.user.upsert({
      where: { telegramId: BigInt(telegramId) },
      update: { firstName, lastName, username },
      create: { 
        telegramId: BigInt(telegramId), 
        firstName, 
        lastName: lastName || null, 
        username: username || null 
      },
    });

    res.json({ success: true, user });
  } catch (error) {
    console.error('Error saving user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Эндпоинт: Проверка здоровья
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});