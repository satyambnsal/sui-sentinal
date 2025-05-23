import clsx from 'clsx'

export const MenuItems = ({ menuOpen }: { menuOpen: boolean }) => {
  return (
    <ul
      className={clsx('flex flex-col xl:flex-row items-start xl:items-center', {
        'w-full': menuOpen,
      })}
    ></ul>
  )
}
