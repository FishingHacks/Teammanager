import {
	Avatar,
	Table,
	Group,
	Text,
	Select,
	ScrollArea,
	Title,
	Loader,
	ActionIcon,
	Anchor,
	Button,
	TextInput,
	Checkbox,
	Textarea,
	Card,
	UnstyledButton,
	Center,
	createStyles,
} from '@mantine/core';
import { openConfirmModal, openModal, closeModal } from '@mantine/modals';
import {
	IconAt,
	IconChevronDown,
	IconChevronUp,
	IconMail,
	IconPencil,
	IconSelector,
	IconSend,
	IconTrash,
} from '@tabler/icons';
import { showNotification } from '@mantine/notifications';
import { User, useFetch, Error, UserRole, getUser } from '../utils';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

function EditUser({
	data,
	setUser,
}: {
	data: User;
	setUser: React.Dispatch<React.SetStateAction<User[]>>;
}) {
	const [mail, setMail] = useState(data.email);
	const [bio, setBio] = useState(data.bio);
	const [name, setName] = useState(data.username);
	const [status, setStatus] = useState(data.status === 'active');
	const [role, setRole] = useState(data.role || 'user');
	const [error, setError] = useState('');
	const [submitting, setSubmitting] = useState(false);

	return (
		<>
			{error && <Error title='Error!' text={error} />}
			<TextInput
				label='Name'
				value={name}
				onChange={(e) => setName(e.target.value)}
				disabled={submitting}
			/>
			<TextInput
				label='Email'
				icon={<IconAt />}
				value={mail}
				onChange={(e) => setMail(e.target.value)}
				disabled={submitting}
			/>
			<Select
				label='Role'
				data={rolesData}
				value={role}
				onChange={setRole as () => void}
				disabled={submitting}
			/>
			<Checkbox
				label='Active?'
				checked={status}
				onChange={(e) => setStatus(e.target.checked)}
				disabled={submitting}
			/>
			<Textarea
				label='About Me'
				value={bio}
				onChange={(e) => setBio(e.target.value)}
				disabled={submitting}
			/>
			<Button
				loading={submitting}
				color='blue'
				onClick={() => {
					if (!name) return setError('Name is not set.');
					if (!mail) return setError('Email is not set.');
					if (!bio) return setError('About Me is not set.');
					if (!/^[^@]+@[^.]+\..+$/.test(mail))
						return setError('Email is not an Email');
					const _u: User = {
						bio,
						email: mail,
						id: data.id,
						role,
						status: status ? 'active' : 'disabled',
						username: name,
					};
					setSubmitting(true);
					fetch(`${window.location.origin}/api/user/${data.id}/update`, {
						method: 'post',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify(_u),
					})
						.then((r) => {
							if (!r.ok) {
								setSubmitting(false);
								setError(
									r.status === 403
										? "You don't have the rights to do that"
										: 'Unknown Error',
								);
								return null;
							}
							return r.json();
						})
						.then((el) => {
							if (el !== null && el.error !== undefined) {
								setUser((u) => [...u.filter((el) => el.id !== data.id), _u]);
								closeModal('modalEditUser');
							}
						});
				}}
			>
				Save
			</Button>
		</>
	);
}

export default function Dashboard() {
	const [users, setUsers] = useFetch<Array<User>>(
		`${window.location.origin}/api/users`,
	);
	const user = getUser();
	if (!user) return <></>;

	function openUserModal(data: User) {
		openModal({
			title: 'Edit User',
			children: <EditUser data={data} setUser={setUsers as any} />,
			modalId: 'modalEditUser',
		});
	}

	return (
		<>
			<ScrollArea style={{ width: 'calc(100vw - 90px)', height: 560 }}>
				<Card>
					<Title>Users</Title>
					<Button
						onClick={() =>
							openUserModal({
								bio: 'No bio set.',
								email: '',
								id: crypto.randomUUID().replaceAll("-", ""),
								role: 'user',
								status: 'active',
								username: '',
							})
						}
						my={10}
					>
						New User
					</Button>
					{users === 'error' && (
						<Error text="Couldn't load users!" title='Error!' />
					)}
					{users === 'loading' && <Title>Loading Users</Title>}
					{typeof users === 'object' && user.role === 'admin' && (
						<UsersRolesTable
							editUser={openUserModal}
							changeRole={(id, newRole) => {
								const _u = users.find((el) => el.id === id);
								if (!_u) return;
								fetch(`${window.location.origin}/api/user/${id}/update`, {
									method: 'post',
									body: JSON.stringify({
										..._u,
										role: newRole,
									}),
									headers: {
										'Content-Type': 'application/json',
									},
								})
									.then((r) => {
										if (!r.ok) {
											return showNotification({
												color: 'red',
												title: 'Error!',
												message:
													"Couldn't update role!" +
													(r.status === 403 ? ' Not enough permissions.' : ''),
											});
										}
										setUsers((u) =>
											typeof u === 'object'
												? u.map((el) =>
														el.id === id
															? {
																	...el,
																	role: newRole,
															  }
															: el,
												  )
												: u,
										);
										return showNotification({
											color: 'violet',
											title: 'Success!',
											message: 'Updated role to ' + newRole,
											autoClose: 750,
										});
									})
									.catch((err) => {
										return showNotification({
											color: 'red',
											title: 'Error!',
											message: "Couldn't update role! " + err.toString(),
										});
									});
							}}
							deleteUser={(id: string) => {
								fetch(`${window.location.origin}/api/user/${id}`, {
									method: 'delete',
								})
									.then((r) => {
										if (!r.ok) {
											return showNotification({
												color: 'red',
												title: 'Error!',
												message: `Couldn't delete user.${
													r.status === 403 ? ' Not authorized' : ''
												}`,
											});
										}
										setUsers((u) =>
											typeof u !== 'object'
												? u
												: u.filter((el) => el.id !== id),
										);
										showNotification({
											message: 'Deleted User',
											color: 'red',
										});
									})
									.catch((err) => {
										return showNotification({
											color: 'red',
											title: 'Error!',
											message: `Couldn't delete user. ${err.toString()}`,
										});
									});
							}}
							data={users}
						/>
					)}
				</Card>
			</ScrollArea>
		</>
	);
}

interface UsersTableProps {
	data: User[];
	deleteUser: (id: string) => void;
	changeRole: (id: string, role: UserRole) => void;
	editUser: (user: User) => void;
}
const rolesData = [
	'admin',
	'collaborator',
	'tester',
	'programmer',
	'supporter',
	'moderator',
	'user',
];

function UsersRolesTable({
	data,
	deleteUser,
	changeRole,
	editUser,
}: UsersTableProps) {
	const navigate = useNavigate();
	const [sorting, setSorting] = useState<'name' | 'role' | 'email'>('name');
	const [ascending, setAscending] = useState(true);

	const rows = data
		.sort((el1, el2) => {
			const _val =
				sorting === 'name'
					? el1.username.localeCompare(el2.username)
					: sorting === 'role'
					? el1.role.localeCompare(el2.role)
					: el1.email.localeCompare(el2.email);
			return _val * (ascending ? 1 : -1);
		})
		.map((item) => {
			const _ref: React.RefObject<HTMLAnchorElement> = { current: null };
			return (
				<tr key={item.id}>
					<td>
						<Group spacing='sm'>
							<Avatar size={40} src={null} alt={item.username} radius={40}>
								{item.username
									.split('')
									.map((el) => (el.match(/[A-Z]/) ? el : ''))
									.join('')}
							</Avatar>
							<div>
								<Text size='sm' weight={500} style={{ maxWidth: 70 }}>
									{item.username}
								</Text>
							</div>
						</Group>
					</td>

					<td>
						<Select
							disabled={item.id === getUser()?.id}
							data={rolesData}
							defaultValue={item.role}
							variant='unstyled'
							onChange={(newRole) =>
								rolesData.includes(newRole as UserRole)
									? changeRole(item.id, newRole as UserRole)
									: null
							}
						/>
					</td>
					<td>
						<Anchor<'a'>
							href={'mailto:' + item.email}
							style={{ width: 70 }}
							ref={_ref}
						>
							{item.email}
						</Anchor>
					</td>
					<td>
						<Group style={{ gap: 0 }}>
							<ActionIcon onClick={() => _ref.current?.click()}>
								<IconMail stroke={1.5} size={16} />
							</ActionIcon>
							<ActionIcon
								hidden={item.id === getUser()?.id}
								onClick={() => navigate('/messages/' + item.id)}
							>
								<IconSend stroke={1.5} size={16} />
							</ActionIcon>
						</Group>
						<Group style={{ gap: 0 }}>
							<ActionIcon onClick={() => editUser(item)}>
								<IconPencil stroke={1.5} size={16} />
							</ActionIcon>
							<ActionIcon
								hidden={item.id === getUser()?.id}
								color='red'
								onClick={() => {
									openConfirmModal({
										title: "Delete Account '" + item.username + "'?",
										children: (
											<Text size='sm'>
												This action is <span color='red'>IRREVERSIBLE</span>
											</Text>
										),
										labels: {
											confirm: 'Delete Account',
											cancel: 'No! Stop!',
										},
										confirmProps: { color: 'red' },
										onConfirm: () => deleteUser(item.id),
									});
								}}
							>
								<IconTrash stroke={1.5} size={16} />
							</ActionIcon>
						</Group>
					</td>
				</tr>
			);
		});

	function setSort(name: 'role' | 'email' | 'name') {
		if (sorting === name) return setAscending((a) => !a);
		setSorting(name);
		setAscending(true);
	}

	return (
		<ScrollArea>
			<Table verticalSpacing='sm'>
				<thead>
					<tr>
						<Th
							sorted={sorting === 'name'}
							reversed={!ascending}
							onSort={() => setSort('name')}
						>
							Name
						</Th>
						<Th
							sorted={sorting === 'role'}
							reversed={!ascending}
							onSort={() => setSort('role')}
						>
							Role
						</Th>
						<Th
							sorted={sorting === 'email'}
							reversed={!ascending}
							onSort={() => setSort('email')}
						>
							Email
						</Th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>{rows}</tbody>
			</Table>
		</ScrollArea>
	);
}

interface ThProps {
	children: React.ReactNode;
	reversed: boolean;
	sorted: boolean;
	onSort(): void;
}

const useStyles = createStyles((theme) => ({
	th: {
		padding: '0 !important',
	},

	control: {
		width: '100%',
		padding: `${theme.spacing.xs}px ${theme.spacing.md}px`,

		'&:hover': {
			backgroundColor:
				theme.colorScheme === 'dark'
					? theme.colors.dark[6]
					: theme.colors.gray[0],
		},
	},

	icon: {
		width: 21,
		height: 21,
		borderRadius: 21,
	},
}));

function Th({ children, reversed, sorted, onSort }: ThProps) {
	const { classes } = useStyles();
	const Icon = sorted
		? reversed
			? IconChevronUp
			: IconChevronDown
		: IconSelector;
	return (
		<th className={classes.th}>
			<UnstyledButton onClick={onSort} className={classes.control}>
				<Group position='apart'>
					<Text weight={500} size='sm'>
						{children}
					</Text>
					<Center className={classes.icon}>
						<Icon size={14} stroke={1.5} />
					</Center>
				</Group>
			</UnstyledButton>
		</th>
	);
}
