import * as Yup from 'yup';
import { User } from '../models';

class UserController {
  async index(req, res) {
    const users = await User.findAll({
      attributes: { exclude: ['password_hash'] },
    });

    return res.json(users);
  }

  async show(req, res) {
    const user = await User.findByPk(req.params.id);

    if (user) {
      const { id, name, email, active } = user;

      return res.json({
        id,
        name,
        email,
        active,
      });
    }

    return res.status(400).json({ error: 'User not found' });
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string()
        .required()
        .min(6),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const userExist = await User.findOne({ where: { email: req.body.email } });

    if (userExist) {
      return res.status(400).json({ error: 'User already exists. ' });
    }

    const { id, name, email, active } = await User.create(req.body);

    return res.json({ id, name, email, active });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      oldPassword: Yup.string().min(6),
      password: Yup.string()
        .min(6)
        .when('oldPassword', (oldPassword, field) =>
          oldPassword ? field.required() : field
        ),
      confirmPassword: Yup.string().when('password', (password, field) =>
        password ? field.required().oneOf([Yup.ref('password')]) : field
      ),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { userId: loggedUserId } = req;
    const { email: newEmail, oldPassword, userId } = req.body;
    let user;

    if (userId) {
      user = await User.findByPk(userId);
    } else {
      user = await User.findByPk(loggedUserId);
    }

    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    if (newEmail && newEmail !== user.email) {
      const userExists = await User.findOne({ where: { email: newEmail } });

      if (userExists) {
        return res
          .status(400)
          .json({ error: 'This email is used by other user. ' });
      }
    }

    if (oldPassword && !(await user.validPassword(oldPassword))) {
      return res.status(400).json({ error: 'Password does not match' });
    }

    const { id, name, active, email } = await user.update(req.body);
    return res.json({ id, name, email, active });
  }

  async delete(req, res) {
    const user = await User.findByPk(req.params.id);

    if (user) {
      await user.destroy();

      return res.status(200).json({ success: true });
    }

    return res.status(400).json({ error: 'User not found' });
  }
}

export default new UserController();
